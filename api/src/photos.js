import fs from 'fs'
import path from 'path'
import util from 'util'
import { exec } from 'child_process'
import express from 'express'
import exifr from 'exifr'
import {
  rejectionHandler,
} from './utils'
import db from './db'
import config from './config'
import logger from './logger'

const router = express.Router()

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

router.get('/', rejectionHandler(async (req) => {
  return db.query('SELECT * FROM Photo WHERE incidentId IS NULL AND ignorePhoto = 0 ORDER BY timestamp ASC')
}))


router.post('/cleanup', rejectionHandler(async (req) => {
  const photos = await db.query('SELECT * FROM Photo WHERE incidentId IS NULL AND ignorePhoto = 0 ORDER BY timestamp ASC')

  await Promise.mapSeries(photos, async (photo) => {
    try {
      await fs.promises.access(`${photo.dirpath}/${photo.filename}`, fs.constants.F_OK)
      return
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`File ${photo.filename} does not exist, removing...`)
        await db.query('DELETE FROM Photo WHERE filename = ?', [photo.filename])
        return
      }
      throw err
    }
  })
}))

router.post('/crawl', rejectionHandler(async (req) => {
  const dbConnection = await db.getConnection()
  try {
    logger.info(`Crawling for new photos...`)
    for await (const p of walk(config.MAIN.photos_dir)) {
      const filename = path.basename(p)

      if (!filename.toLowerCase().endsWith(".jpg")) {
        continue
      }

      const dirpath = path.dirname(p)
      const [photo] = await dbConnection.query('SELECT * FROM Photo WHERE filename = ?', [filename])

      if (photo) {
        continue
      }

      logger.info(`Processing file ${p}`)

      const exifData = await exifr.parse(p, ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal'])

      const long = (
        exifData?.GPSLongitude
          ? (
            exifData.GPSLongitude[0]
              + exifData.GPSLongitude[1] / 60
              + exifData.GPSLongitude[2] / 3600)
          : null
      )
      const lat = (
        exifData?.GPSLatitude
          ? (
            exifData.GPSLatitude[0]
              + exifData.GPSLatitude[1] / 60
              + exifData.GPSLatitude[2] / 3600)
          : null
      )

      await dbConnection.query('START TRANSACTION')
      await dbConnection.query('INSERT INTO Photo SET ?', [{
        filename,
        dirpath,
        timestamp: exifData?.DateTimeOriginal,
      }])

      if (long && lat) {
        await dbConnection.query(`UPDATE Photo SET geolocation = POINT(${long}, ${lat}) WHERE filename = ?`, [filename])
      }

      await dbConnection.query('COMMIT')
    }
    logger.info('Crawling finished.')
  } catch (err) {
    await dbConnection.query('ROLLBACK')
    throw err
  } finally {
    db.releaseConnection(dbConnection)
  }
}))

router.put('/ignored', rejectionHandler(async (req) => {
  const {
    filenames,
    ignored,
  } = req.body

  const dbConnection = await db.getConnection()

  try {
    await dbConnection.query('START TRANSACTION')

    await Promise.mapSeries(filenames, async (filename) => {
      await dbConnection.query('UPDATE Photo SET ignorePhoto = ? WHERE filename = ?', [ignored, filename])
    })

    await dbConnection.query('COMMIT')
  } catch (err) {
    await dbConnection.query('ROLLBACK')
  } finally {
    db.releaseConnection(dbConnection)
  }
}))

export default router

import util from 'util'
import { exec } from 'child_process'
import express from 'express'
import { DateTime } from 'luxon'
import {
  rejectionHandler,
} from './utils'
import db from './db'
import { NotFoundError } from './errors'
import {
  generateIncidentReportEmail,
  sendIncidentReportEmail,
} from './email'
import logger from './logger'

const execAsync = util.promisify(exec)

const router = express.Router()

router.get('/', rejectionHandler(async (req) => db.query('SELECT * FROM IncidentExtra WHERE reportedAt is NULL and ignoreIncident = 0 ORDER by seenAt ASC')))

router.get('/:incidentId', rejectionHandler(async (req) => {
  const {
    incidentId,
  } = req.params || {}
  const [incident] = await db.query('SELECT * FROM IncidentExtra WHERE incidentId = ?', [incidentId])

  if (!incident) {
    throw new NotFoundError()
  }

  incident.geolocation = {
    longitude: incident.geolocation.x,
    latitude: incident.geolocation.y,
  }

  incident.seenAt = incident.seenAt.toISOString()

  const photos = await db.query('SELECT * FROM Photo WHERE incidentId = ? ORDER BY timestamp', [incidentId])

  return {
    ...incident,
    photos,
  }
}))

router.put('/:incidentId/ignore', rejectionHandler(async (req) => {
  const {
    incidentId,
  } = req.params || {}
  const [incident] = await db.query('SELECT * FROM IncidentExtra WHERE incidentId = ?', [incidentId])

  if (!incident) {
    throw new NotFoundError()
  }

  await db.query('UPDATE Incident SET ignoreIncident = 1 WHERE incidentId = ?', [incidentId])
}))

router.post('/:incidentId/openPhotoEditor', rejectionHandler(async (req) => {
  const {
    incidentId,
  } = req.params || {}
  const [incident] = await db.query('SELECT * FROM IncidentExtra WHERE incidentId = ?', [incidentId])

  if (!incident) {
    throw new NotFoundError()
  }

  const photos = await db.query('SELECT * FROM Photo WHERE incidentId = ?', [incidentId])

  await Promise.mapSeries(photos, async (photo) => {
    await execAsync(`/usr/bin/gimp ${photo.dirpath}/${photo.filename}`)
  })
}))

router.get('/:incidentId/reportPreview', rejectionHandler(async (req) => {
  const {
    incidentId,
  } = req.params || {}

  const message = await generateIncidentReportEmail(incidentId)

  return message.text
}))

router.post('/:incidentId/report', rejectionHandler(async (req) => {
  const {
    incidentId,
  } = req.params || {}

  logger.info(`Reporting incident ${incidentId}`)

  await sendIncidentReportEmail(incidentId)

  await db.query('UPDATE Incident SET reportedAt = ? WHERE incidentId = ?', [
    DateTime.local().toSQL({ includeOffset: false }),
    incidentId,
  ])

  logger.info(`Successfully reported incident ${incidentId}`)
}))

router.put('/:incidentId/photos/:filename/ignore', rejectionHandler(async (req) => {
  const {
    incidentId,
    filename,
  } = req.params || {}

  const {
    ignorePhoto,
  } = req.body

  await db.query('UPDATE Photo SET ignorePhoto = ? WHERE incidentId = ? AND filename = ?', [
    ignorePhoto,
    incidentId,
    filename,
  ])
}))

router.delete('/:incidentId/photos/:filename', rejectionHandler(async (req) => {
  const {
    incidentId,
    filename,
  } = req.params || {}

  await db.query('UPDATE Photo SET incidentId = NULL WHERE incidentId = ? AND filename = ?', [incidentId, filename])
}))

router.post('/', rejectionHandler(async (req) => {
  const {
    vehicleId,
    locationId,
    violationTypeId,
    photos,
  } = req.body || {}

  const dbConnection = await db.getConnection()

  try {
    await dbConnection.query('START TRANSACTION')

    const [firstPhoto] = await dbConnection.query(`
      SELECT timestamp
      FROM Photo
      WHERE (
        incidentId IS NULL
        AND filename IN (?)
      )
      ORDER BY timestamp ASC
      LIMIT 1`, [
      photos,
    ])
    await dbConnection.query('INSERT INTO Incident SET ?', [{
      vehicleId,
      locationId,
      seenAt: firstPhoto.timestamp,
    }])
    const [{ incidentId }] = await dbConnection.query('SELECT LAST_INSERT_ID() AS incidentId')
    await dbConnection.query('INSERT INTO ViolationTypeIncident SET ?', [{
      violationTypeId,
      incidentId,
    }])
    await dbConnection.query(`
      UPDATE Photo
      SET incidentId = ?
      WHERE (
        incidentId IS NULL
        AND filename IN (?)
      )`, [
      incidentId,
      photos,
    ])
    await dbConnection.query('COMMIT')
    return {
      incidentId,
    }
  } catch (err) {
    dbConnection.query('ROLLBACK')
    throw err
  } finally {
    db.releaseConnection(dbConnection)
  }
}))

export default router

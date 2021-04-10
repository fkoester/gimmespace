import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/', rejectionHandler(async (req) => db.query('SELECT * FROM Evidence')))
router.get('/:evidenceId', rejectionHandler(async (req) => {
  const {
    evidenceId,
  } = req.params

  const [
    locationId,
    vehicleId,
  ] = evidenceId.split('_')

  const [evidence] = await db.query('SELECT * FROM Evidence WHERE locationId = ? AND vehicleId = ?', [
    locationId,
    vehicleId,
  ])

  const filenames = evidence.filenames.split('\u001D')

  const photos = await db.query('SELECT * FROM Photo WHERE filename IN (?) ORDER BY timestamp', [filenames])

  return {
    ...evidence,
    photos,
  }
}))

export default router

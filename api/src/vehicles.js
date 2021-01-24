import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'
import { NotFoundError } from './errors'

const router = express.Router()

router.get('/', rejectionHandler(async (req) => {
  const vehicles = await db.query(`
  SELECT *
  FROM VehicleExtra
  WHERE vehicleRegistrationId LIKE ?
  `, [
    `%${req.query.query}%`,
  ])
  return vehicles
}))

router.get('/:vehicleId', rejectionHandler(async (req) => {
  const {
    vehicleId,
  } = req.params || {}

  const [vehicle] = await db.query('SELECT * FROM VehicleExtra WHERE vehicleId = ?', [vehicleId])

  if (!vehicle) {
    throw new NotFoundError()
  }
  return vehicle
}))

router.post('/', rejectionHandler(async (req) => {
  const {
    vehicleRegistrationId,
    vehicleBrandId,
    vehicleColorId,
    firstSeenAt,
  } = req.body

  const dbConnection = await db.getConnection()

  try {
    await dbConnection.query('START TRANSACTION')

    await dbConnection.query('INSERT INTO Vehicle SET ?', [{
      vehicleBrandId,
      vehicleColorId,
    }])
    const [{ vehicleId }] = await dbConnection.query('SELECT LAST_INSERT_ID() AS vehicleId')
    await dbConnection.query('INSERT INTO VehicleRegistration SET ?', [{
      countryCode: 'DE',
      vehicleRegistrationId,
      firstSeenAt,
      vehicleId,
    }])
    await dbConnection.query('COMMIT')
    return {
      vehicleId,
    }
  } catch (err) {
    await dbConnection.query('ROLLBACK')
    throw err
  } finally {
    db.releaseConnection(dbConnection)
  }
}))

export default router

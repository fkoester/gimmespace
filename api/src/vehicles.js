import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/search', rejectionHandler(async (req) => {
  const vehicles = await db.query(`
  SELECT *
  FROM VehicleExtra
  WHERE vehicleRegistrationId LIKE ?
  `, [
    `%${req.query.query}%`,
  ])
  return vehicles
}))

router.get('/brands', rejectionHandler((req) => db.query('SELECT * FROM VehicleBrand ORDER By vehicleBrandId')))
router.get('/colors', rejectionHandler((req) => db.query('SELECT * FROM VehicleColor ORDER By vehicleColorId')))

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

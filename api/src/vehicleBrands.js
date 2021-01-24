import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/', rejectionHandler((req) => db.query('SELECT * FROM VehicleBrand ORDER By vehicleBrandId')))

export default router

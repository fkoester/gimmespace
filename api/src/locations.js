import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/search', rejectionHandler(async (req) => db.query(`
  SELECT *
  FROM Location
  WHERE displayName LIKE ?
  ORDER BY displayName
  `, [`%${req.query.query}%`])))

router.post('/', rejectionHandler(async (req) => {
  const {
    geolocation: {
      longitude,
      latitude,
    },
    postcode,
    street,
    housenumber,
    displayName,
    description,
  } = req.body

  await db.query(`
    INSERT INTO Location
    SET
      geolocation = POINT(?, ?),
      postcode = ?,
      street = ?,
      housenumber = ?,
      displayName = ?,
      description = ?;`,
  [
    longitude,
    latitude,
    postcode,
    street,
    housenumber,
    displayName,
    description])
}))

export default router

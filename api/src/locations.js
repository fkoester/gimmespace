import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/search', rejectionHandler(async (req) => {
  return db.query(`
  SELECT *
  FROM Location
  WHERE displayName LIKE ?
  ORDER BY displayName
  `, [
    `%${req.query.query}%`,
  ])
}))

export default router

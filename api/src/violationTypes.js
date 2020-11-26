import express from 'express'
import {
  rejectionHandler,
} from './utils'
import db from './db'

const router = express.Router()

router.get('/search', rejectionHandler(async (req) => {
  return db.query(`
  SELECT *
  FROM ViolationType
  WHERE shortName LIKE ?
  ORDER BY shortName
  `, [
    `%${req.query.query}%`,
  ])
}))

export default router

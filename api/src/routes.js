import express from 'express'
import incidentsRouter from './incidents'
import photosRouter from './photos'
import vehiclesRouter from './vehicles'
import locationsRouter from './locations'
import violationTypesRouter from './violationTypes'

const router = express.Router()

router.use('/incidents', incidentsRouter)
router.use('/photos', photosRouter)
router.use('/vehicles', vehiclesRouter)
router.use('/locations', locationsRouter)
router.use('/violationTypes', violationTypesRouter)

export default router

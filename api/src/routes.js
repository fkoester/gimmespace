import express from 'express'
import incidentsRouter from './incidents'
import evidencesRouter from './evidences'
import photosRouter from './photos'
import vehiclesRouter from './vehicles'
import locationsRouter from './locations'
import violationTypesRouter from './violationTypes'
import vehicleColorsRouter from './vehicleColors'
import vehicleBrandsRouter from './vehicleBrands'

const router = express.Router()

router.use('/incidents', incidentsRouter)
router.use('/evidences', evidencesRouter)
router.use('/photos', photosRouter)
router.use('/vehicles', vehiclesRouter)
router.use('/locations', locationsRouter)
router.use('/violationTypes', violationTypesRouter)
router.use('/vehicleColors', vehicleColorsRouter)
router.use('/vehicleBrands', vehicleBrandsRouter)

export default router

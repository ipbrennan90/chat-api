import { Router } from 'express'
import { EventController } from '../controllers'
import requireParams from '../utils/require_params'

const router = Router()

router.post(
  '/events',
  requireParams(['date', 'user', 'type']),
  EventController.create
)

export default router

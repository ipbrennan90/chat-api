import { Router } from 'express'
import { EventController } from '../controllers'
import requireParams from '../utils/require_params'

const router = Router()

router.post(
  '/events',
  requireParams(['date', 'user', 'type']),
  EventController.create
)

router.post('/events/clear', EventController.clear)

router.get(
  '/events',
  requireParams(['from', 'to'], true),
  EventController.index
)

router.get(
  '/events/summary',
  requireParams(['from', 'to', 'by'], true),
  EventController.summary
)

export default router

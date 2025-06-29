// src/routes/transferRoutes.ts
import express, { Router } from 'express';
import { createRecipient, initiatePayment } from '../controllers/transferController';

const router: Router = express.Router();

router.post('/create-recipient', createRecipient);
router.post('/initiate-transfer', initiatePayment);

export default router;
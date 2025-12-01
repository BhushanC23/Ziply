import express from 'express';
import multer from 'multer';
import { createShare, getShare, downloadFile } from '../controllers/shareController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 75 * 1024 * 1024 }, // 75MB
});

router.post('/', upload.single('file'), createShare);
router.get('/:id', getShare);
router.get('/download/:id', downloadFile);

export default router;

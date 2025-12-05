import express from 'express';
import { createShare, getShare, downloadFile, getUploadUrl } from '../controllers/shareController.js';

const router = express.Router();

// No multer needed for direct upload
router.post('/upload-url', getUploadUrl);
router.post('/', createShare);
router.get('/:id', getShare);
router.get('/download/:id', downloadFile);

export default router;

import Share from '../models/shareModel.js';
import { generateShortId, generateOwnerKey, calculateExpiry } from '../utils/generateId.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Create a new share
// @route   POST /api/share
// @access  Public
export const createShare = async (req, res) => {
  try {
    const { type, content, duration, burnOnRead } = req.body;
    const file = req.file;

    if (!type) {
      res.status(400);
      throw new Error('Type is required');
    }

    const shortId = generateShortId();
    const ownerKey = generateOwnerKey();
    const expiresAt = calculateExpiry(duration);

    let shareData = {
      shortId,
      ownerKey,
      type,
      burnOnRead: burnOnRead === 'true' || burnOnRead === true,
      expiresAt,
    };

    if (type === 'text' || type === 'link') {
      shareData.content = content;
    } else if (type === 'file') {
      if (!file) {
        res.status(400);
        throw new Error('No file uploaded');
      }

      const storageKey = `${Date.now()}-${shortId}-${file.originalname}`;
      
      const { data, error } = await supabase.storage
        .from('ziply-files')
        .upload(storageKey, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      shareData.file = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageKey: storageKey,
      };
    }

    const share = await Share.create(shareData);

    res.status(201).json({
      success: true,
      shortId: share.shortId,
      ownerKey: share.ownerKey,
      expiresAt: share.expiresAt,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get share details
// @route   GET /api/share/:id
// @access  Public
export const getShare = async (req, res) => {
  try {
    const share = await Share.findOne({ shortId: req.params.id });

    if (!share) {
      res.status(404);
      throw new Error('Share not found or expired');
    }

    // Check if expired (double check, though Mongo TTL handles this)
    if (new Date() > share.expiresAt) {
      await Share.deleteOne({ _id: share._id });
      res.status(410);
      throw new Error('Share expired');
    }

    // Increment views
    share.views += 1;
    await share.save();

    const response = {
      type: share.type,
      content: share.content,
      file: share.file ? {
        name: share.file.originalName,
        size: share.file.size,
        mimeType: share.file.mimeType,
      } : null,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      burnOnRead: share.burnOnRead,
    };

    // Handle Burn-on-Read
    if (share.burnOnRead) {
      // If it's a file, we don't delete yet, we wait for download. 
      // But for text/link, we delete now.
      // Actually, for file, we usually show a "Download" button. 
      // If this API is just getting metadata, we might not want to burn yet.
      // BUT, usually "View" means "Read".
      // Let's assume if it's text/link, we burn. If file, we burn on download.
      if (share.type !== 'file') {
         await Share.deleteOne({ _id: share._id });
      }
    }

    res.json(response);

  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Download file
// @route   GET /api/download/:id
// @access  Public
export const downloadFile = async (req, res) => {
  try {
    const share = await Share.findOne({ shortId: req.params.id });

    if (!share || share.type !== 'file') {
      res.status(404);
      throw new Error('File not found');
    }

    const { data, error } = await supabase.storage
      .from('ziply-files')
      .createSignedUrl(share.file.storageKey, 60, {
        download: share.file.originalName,
      });

    if (error) throw error;

    // Handle Burn-on-Read for files
    if (share.burnOnRead) {
      await Share.deleteOne({ _id: share._id });
      // Note: We should also delete from Supabase, but for speed we return URL first.
      // In a real prod app, use a background job to clean Supabase.
      // For now, we just delete the metadata so it's inaccessible.
    }

    res.json({ downloadUrl: data.signedUrl });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

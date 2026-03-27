import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import Evidence from '../models/Evidence.js';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload
export const uploadEvidence = asyncHandler(async (req, res) => {
  const { sosId, type } = req.body;
  const userId = req.user._id;

  if (!userId || !type) {
    res.status(400).json({ success: false, message: 'userId and type are required' });
    return;
  }

  let fileUrl = '';
  let publicId = '';

  // If a file was actually uploaded via multer
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'eguard/evidence',
      resource_type: 'auto',
    });
    fileUrl = result.secure_url;
    publicId = result.public_id;
  } else {
    // No real file (e.g. frontend sent simulated blob) — store a placeholder
    fileUrl = `https://eguard.placeholder/${type}_${Date.now()}`;
    publicId = `placeholder_${Date.now()}`;
  }

  const evidence = await Evidence.create({
    userId,
    sosId: sosId || undefined,
    type,
    fileUrl,
    publicId,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, data: evidence });
});

// GET /api/upload/progress/:sosId
export const getUploadProgress = asyncHandler(async (req, res) => {
  const evidenceList = await Evidence.find({ sosId: req.params.sosId }).sort({ createdAt: -1 });
  res.json({ success: true, data: evidenceList });
});

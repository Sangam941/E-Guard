import cloudinary from '../config/cloudinary.js';
import SOS from '../models/SOS.js';

export const uploadEvidence = async (req, res, next) => {
  try {
    const { sosId, type } = req.body; // type: 'audio' or 'video'
    const file = req.file;

    if (!file || !sosId || !type) {
      return res.status(400).json({
        success: false,
        message: 'File, sosId, and type are required',
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'e-guard-ai/evidence',
          public_id: `${sosId}-${type}-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    // Update SOS record
    const updateData = type === 'audio' ? { audioEvidence: result.secure_url } : { videoEvidence: result.secure_url };
    const sos = await SOS.findByIdAndUpdate(sosId, updateData, { new: true });

    res.json({
      success: true,
      message: `${type} uploaded successfully`,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        sosId: sos._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadProgress = (req, res) => {
  // This is a placeholder for real-time upload progress
  res.json({
    success: true,
    progress: 0,
  });
};

import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  ownerKey: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'file', 'link'],
    required: true,
  },
  content: {
    type: String, // For text or link
  },
  file: {
    originalName: String,
    mimeType: String,
    size: Number,
    storageKey: String,
    url: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  burnOnRead: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL Index: MongoDB removes doc when expiresAt is reached
  },
}, {
  timestamps: true,
});

const Share = mongoose.model('Share', shareSchema);

export default Share;

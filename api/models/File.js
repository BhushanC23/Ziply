const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    storageKey: {
        type: String,
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // TTL Index: Automatically delete after 24 hours (86400 seconds)
    }
});

module.exports = mongoose.model('File', FileSchema);

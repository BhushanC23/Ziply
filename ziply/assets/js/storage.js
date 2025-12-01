/**
 * Ziply Storage Manager
 * Simulates a backend database using localStorage
 */

const ZiplyStorage = {
    key: 'ziply_shares',

    // Generate a random 6-character ID
    generateId: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Save a new share
    createShare: async (data) => {
        // Instant storage
        
        // --- BACKEND HOOK: Encryption ---
        // TODO: Implement real encryption here before sending to backend.
        // const encryptedContent = await ZiplyCrypto.encrypt(data.content);
        
        // --- BACKEND HOOK: File Upload ---
        let storedContent = data.content;
        if (data.type === 'file' && typeof data.content === 'object') {
            // In a real backend, 'data.content' would be a File object.
            // We would upload it to S3/Cloudinary here and get a URL back.
            // For now (LocalStorage), we just store the filename.
            console.log('Simulating File Upload:', data.content.name);
            storedContent = data.content.name; 
        }

        const shares = ZiplyStorage.getAll();
        const newShare = {
            id: data.id || ZiplyStorage.generateId(),
            ownerKey: Math.random().toString(36).substring(2, 15), // Simple random key for ownership
            type: data.type || 'text',
            content: storedContent || '', // Text content, filename, or URL
            meta: data.meta || {}, // File size, etc.
            createdAt: Date.now(),
            expiresAt: data.expiresAt || (Date.now() + 24 * 60 * 60 * 1000), // Default 24h
            views: 0,
            burnOnRead: data.burnOnRead || false,
            isBurned: false
        };
        shares.push(newShare);
        localStorage.setItem(ZiplyStorage.key, JSON.stringify(shares));
        return newShare;
    },

    // Get a share by ID
    getShare: async (id) => {
        // Instant retrieval
        
        const shares = ZiplyStorage.getAll();
        return shares.find(s => s.id === id) || null;
    },

    // Get all shares (for history)
    getAll: () => {
        const data = localStorage.getItem(ZiplyStorage.key);
        return data ? JSON.parse(data) : [];
    },

    // Update a share (e.g., increment views, mark burned)
    updateShare: async (id, updates) => {
        // Instant update

        const shares = ZiplyStorage.getAll();
        const index = shares.findIndex(s => s.id === id);
        if (index !== -1) {
            shares[index] = { ...shares[index], ...updates };
            localStorage.setItem(ZiplyStorage.key, JSON.stringify(shares));
            return shares[index];
        }
        return null;
    },

    // Check status of a share
    getStatus: (share) => {
        if (!share) return 'not_found';
        if (share.isBurned) return 'burned';
        if (Date.now() > share.expiresAt) return 'expired';
        return 'active';
    },

    // Format relative time (e.g., "2 hours ago")
    timeAgo: (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    },
    
    // Format time remaining
    timeRemaining: (timestamp) => {
        const seconds = Math.floor((timestamp - Date.now()) / 1000);
        if (seconds <= 0) return "Expired";
        
        const days = Math.floor(seconds / 86400);
        if (days > 0) return days + " days left";
        
        const hours = Math.floor(seconds / 3600);
        if (hours > 0) return hours + " hours left";
        
        const minutes = Math.floor(seconds / 60);
        return minutes + " mins left";
    },

    // Delete a share
    deleteShare: (id) => {
        let shares = ZiplyStorage.getAll();
        shares = shares.filter(s => s.id !== id);
        localStorage.setItem(ZiplyStorage.key, JSON.stringify(shares));
    },

    // Clear all history
    clearAll: () => {
        localStorage.removeItem(ZiplyStorage.key);
    }
};

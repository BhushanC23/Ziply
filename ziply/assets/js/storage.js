/**
 * Ziply Client-Side History Manager
 * Stores share history in localStorage
 */

const ZiplyStorage = {
    KEY: 'ziply_history_v1',

    getHistory() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading history:', e);
            return [];
        }
    },

    addToHistory(share) {
        try {
            const history = this.getHistory();
            
            // Create a history item
            const item = {
                id: share.shortId,
                type: share.type,
                content: share.type === 'text' ? share.content.substring(0, 50) + (share.content.length > 50 ? '...' : '') : share.content, // Truncate text
                fileName: share.fileData ? share.fileData.originalName : null,
                fileSize: share.fileData ? share.fileData.size : null,
                createdAt: Date.now(),
                expiresAt: new Date(Date.now() + this.parseDuration(share.duration)).getTime(),
                burnOnRead: share.burnOnRead,
                ownerKey: share.ownerKey
            };

            // Add to beginning, limit to 50 items
            history.unshift(item);
            if (history.length > 50) history.pop();

            localStorage.setItem(this.KEY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Error saving history:', e);
            return false;
        }
    },

    removeFromHistory(id) {
        try {
            let history = this.getHistory();
            history = history.filter(item => item.id !== id);
            localStorage.setItem(this.KEY, JSON.stringify(history));
            return true;
        } catch (e) {
            return false;
        }
    },

    clearHistory() {
        localStorage.removeItem(this.KEY);
    },

    // Helper to parse duration string to ms
    parseDuration(durationStr) {
        if (!durationStr) return 24 * 60 * 60 * 1000; // Default 1d
        const unit = durationStr.slice(-1);
        const val = parseInt(durationStr.slice(0, -1));
        
        switch(unit) {
            case 'm': return val * 60 * 1000;
            case 'h': return val * 60 * 60 * 1000;
            case 'd': return val * 24 * 60 * 60 * 1000;
            default: return 24 * 60 * 60 * 1000;
        }
    }
};
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

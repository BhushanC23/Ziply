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



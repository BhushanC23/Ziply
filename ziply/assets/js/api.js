const ZiplyAPI = {
    // Auto-detect environment: Use localhost for dev, relative path for production
    BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : '/api',

    async createShare(data) {
        let body;
        let headers = {};

        if (data.type === 'file') {
            const formData = new FormData();
            formData.append('type', 'file');
            formData.append('duration', data.duration);
            formData.append('burnOnRead', data.burnOnRead);
            formData.append('file', data.content); // Expecting File object
            body = formData;
        } else {
            body = JSON.stringify({
                type: data.type,
                content: data.content,
                duration: data.duration,
                burnOnRead: data.burnOnRead
            });
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${this.BASE_URL}/share`, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Share creation failed');
        }

        return await response.json();
    },

    async getShare(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/share/${id}`);
            if (!response.ok) {
                // Return status to handle 404/410 in UI
                return { error: true, status: response.status };
            }
            return await response.json();
        } catch (e) {
            return { error: true, status: 500 };
        }
    },

    async getDownloadUrl(id) {
        const response = await fetch(`${this.BASE_URL}/share/download/${id}`);
        if (!response.ok) {
            throw new Error('Download failed');
        }
        return await response.json();
    },

    // Utils
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    timeAgo(dateString) {
        const date = new Date(dateString);
        const seconds = Math.floor((Date.now() - date) / 1000);
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
        return Math.floor(seconds) + " seconds ago";
    },

    timeRemaining(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const distance = date - now;

        if (distance < 0) return 'Expired';

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        timeString += `${minutes}m`;
        return timeString.trim() || '0m';
    }
};

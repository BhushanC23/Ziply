export const generateShortId = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateOwnerKey = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const calculateExpiry = (duration) => {
  const now = new Date();
  switch (duration) {
    case '10m': return new Date(now.getTime() + 10 * 60 * 1000);
    case '1h': return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 1 day
  }
};

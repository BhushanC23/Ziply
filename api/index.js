import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import shareRoutes from './routes/shareRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simple static serving
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../ziply')));

// Routes
app.get('/api', (req, res) => res.send('Ziply API Running 🚀'));
app.use('/api/share', shareRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../ziply/index.html'));
});

// Error Handler
app.use(errorHandler);

// Export for Vercel
export default app;

// Start Server (Render/Local)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
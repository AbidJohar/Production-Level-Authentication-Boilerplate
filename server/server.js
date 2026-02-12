 import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';
import { logger } from './utility/logger.js';


dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB(); // connect MongoDB
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

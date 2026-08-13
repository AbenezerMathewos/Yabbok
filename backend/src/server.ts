import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

import discussionsRouter from './routes/discussions';
import prayersRouter from './routes/prayers';
import adminRouter from './routes/admin';

// Mount routers
app.use('/api/discussions', discussionsRouter);
app.use('/api/prayers', prayersRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

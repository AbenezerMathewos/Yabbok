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
import uploadRouter from './routes/upload';
import churchesRouter from './routes/churches';
import eventsRouter from './routes/events';
import galleryRouter from './routes/gallery';
import insightsRouter from './routes/insights';
import notificationsRouter from './routes/notifications';
import profileRouter from './routes/profile';
import reportsRouter from './routes/reports';
import sermonsRouter from './routes/sermons';
import suggestionsRouter from './routes/suggestions';
import testimoniesRouter from './routes/testimonies';
import chatRouter from './routes/chat';
import audioMessagesRouter from './routes/audio-messages';
import booksRouter from './routes/books';

// Mount routers
app.use('/api/discussions', discussionsRouter);
app.use('/api/prayers', prayersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/churches', churchesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sermons', sermonsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/testimonies', testimoniesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/audio-messages', audioMessagesRouter);
app.use('/api/books', booksRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

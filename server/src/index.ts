import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import boardsRouter from './routes/boards.js';
import topicsRouter from './routes/topics.js';
import { registerSocketEvents } from './socket.js';

const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());

const app = express();
app.use(express.json());
app.use(cors({
  origin: corsOrigin || '*'
}));

app.use('/boards', boardsRouter);
app.use('/topics', topicsRouter);

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigin || '*'
  }
});

registerSocketEvents(io);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

httpServer.listen(port, () => {
  console.log(`Insight Lean Coffee server running on port ${port}`);
});

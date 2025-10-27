import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../lib/prisma.js';
import { io } from '../socket.js';

const router = Router();

router.post('/', async (req, res) => {
  const { boardId, title } = req.body as { boardId?: string; title?: string };

  if (!boardId || !title) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Board ID and title are required' });
  }

  try {
    const topic = await prisma.topic.create({
      data: {
        boardId,
        title
      }
    });

    io?.to(boardId).emit('topic:add', topic);

    res.status(StatusCodes.CREATED).json(topic);
  } catch (error) {
    console.error('Failed to create topic', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create topic' });
  }
});

export default router;

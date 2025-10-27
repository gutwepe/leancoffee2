import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/', async (req, res) => {
  const { title } = req.body as { title?: string };

  if (!title) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title is required' });
  }

  try {
    const board = await prisma.board.create({
      data: { title }
    });

    res.status(StatusCodes.CREATED).json(board);
  } catch (error) {
    console.error('Failed to create board', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create board' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: { topics: { orderBy: { votes: 'desc' } } }
    });

    if (!board) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Failed to fetch board', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch board' });
  }
});

export default router;

import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from './lib/prisma.js';

export let io: SocketIOServer | null = null;

type StagePayload = {
  boardId: string;
  stage: 'IDEATION' | 'VOTING' | 'DISCUSSION' | 'WRAP_UP';
};

type TimerPayload = {
  boardId: string;
  timerEnd: string | null;
};

type VotePayload = {
  boardId: string;
  topicId: string;
};

type DiscussedPayload = {
  boardId: string;
  topicId: string;
  discussed: boolean;
};

export const registerSocketEvents = (server: SocketIOServer) => {
  io = server;

  io.on('connection', (socket: Socket) => {
    socket.on('board:join', (boardId: string) => {
      socket.join(boardId);
    });

    socket.on('topic:vote', async ({ boardId, topicId }: VotePayload) => {
      await prisma.topic.update({
        where: { id: topicId },
        data: { votes: { increment: 1 } }
      });

      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (topic) {
        io?.to(boardId).emit('topic:vote', topic);
      }
    });

    socket.on('topic:discussed', async ({ boardId, topicId, discussed }: DiscussedPayload) => {
      await prisma.topic.update({
        where: { id: topicId },
        data: { discussed }
      });

      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (topic) {
        io?.to(boardId).emit('topic:discussed', topic);
      }
    });

    socket.on('board:stage', async ({ boardId, stage }: StagePayload) => {
      await prisma.board.update({
        where: { id: boardId },
        data: { stage }
      });

      io?.to(boardId).emit('board:stage', { boardId, stage });
    });

    socket.on('board:timer', async ({ boardId, timerEnd }: TimerPayload) => {
      await prisma.board.update({
        where: { id: boardId },
        data: { timerEnd: timerEnd ? new Date(timerEnd) : null }
      });

      io?.to(boardId).emit('board:timer', { boardId, timerEnd });
    });
  });
};

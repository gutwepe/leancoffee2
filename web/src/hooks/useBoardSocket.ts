import { useEffect } from 'react';
import { io as createSocket, Socket } from 'socket.io-client';
import { Board, Topic } from '../types';

type UseBoardSocketParams = {
  boardId?: string;
  onTopicAdd: (topic: Topic) => void;
  onTopicVote: (topic: Topic) => void;
  onTopicDiscussed: (topic: Topic) => void;
  onStageChange: (stage: Board['stage']) => void;
  onTimerChange: (timerEnd: string | null) => void;
};

const socketUrl = import.meta.env.VITE_SOCKET_URL as string;
let socket: Socket | undefined;

export const getSocket = () => {
  if (!socket) {
    socket = createSocket(socketUrl, {
      transports: ['websocket']
    });
  }

  return socket;
};

const useBoardSocket = ({
  boardId,
  onTopicAdd,
  onTopicVote,
  onTopicDiscussed,
  onStageChange,
  onTimerChange
}: UseBoardSocketParams) => {
  useEffect(() => {
    const activeSocket = getSocket();

    if (boardId) {
      activeSocket.emit('board:join', boardId);
    }

    activeSocket.on('topic:add', onTopicAdd);
    activeSocket.on('topic:vote', onTopicVote);
    activeSocket.on('topic:discussed', onTopicDiscussed);
    activeSocket.on('board:stage', ({ stage }) => onStageChange(stage));
    activeSocket.on('board:timer', ({ timerEnd }) => onTimerChange(timerEnd));

    return () => {
      activeSocket.off('topic:add', onTopicAdd);
      activeSocket.off('topic:vote', onTopicVote);
      activeSocket.off('topic:discussed', onTopicDiscussed);
      activeSocket.off('board:stage');
      activeSocket.off('board:timer');
    };
  }, [boardId, onTopicAdd, onTopicVote, onTopicDiscussed, onStageChange, onTimerChange]);
};

export default useBoardSocket;

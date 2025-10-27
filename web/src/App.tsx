import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useBoardSocket, { getSocket } from './hooks/useBoardSocket';
import { Board, Stage, Topic } from './types';
import TopicList from './components/TopicList';
import StageControls from './components/StageControls';
import TimerControls from './components/TimerControls';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string
});

const App = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [boardIdInput, setBoardIdInput] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedTopics = useMemo(() => {
    if (!board) return [];
    return [...board.topics].sort((a, b) => b.votes - a.votes || a.createdAt.localeCompare(b.createdAt));
  }, [board]);

  const fetchBoard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Board>(`/boards/${id}`);
        setBoard(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load board. Please check the ID and try again.');
        setBoard(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateBoard = async (event: FormEvent) => {
    event.preventDefault();
    if (!boardTitle.trim()) return;

    try {
      const { data } = await api.post<Board>('/boards', { title: boardTitle.trim() });
      setBoard(data);
      setBoardIdInput(data.id);
      setBoardTitle('');
    } catch (err) {
      console.error(err);
      setError('Could not create board.');
    }
  };

  const handleJoinBoard = (event: FormEvent) => {
    event.preventDefault();
    if (!boardIdInput.trim()) return;
    fetchBoard(boardIdInput.trim());
  };

  const handleTopicAdd = useCallback((topic: Topic) => {
    setBoard((prev) => (prev ? { ...prev, topics: [...prev.topics.filter((t) => t.id !== topic.id), topic] } : prev));
  }, []);

  const handleTopicVote = useCallback((topic: Topic) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            topics: prev.topics.map((t) => (t.id === topic.id ? topic : t))
          }
        : prev
    );
  }, []);

  const handleTopicDiscussed = useCallback((topic: Topic) => {
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            topics: prev.topics.map((t) => (t.id === topic.id ? topic : t))
          }
        : prev
    );
  }, []);

  const handleStageChange = useCallback((stage: Stage) => {
    setBoard((prev) => (prev ? { ...prev, stage } : prev));
  }, []);

  const handleTimerChange = useCallback((timerEnd: string | null) => {
    setBoard((prev) => (prev ? { ...prev, timerEnd } : prev));
  }, []);

  useBoardSocket({
    boardId: board?.id,
    onTopicAdd: handleTopicAdd,
    onTopicVote: handleTopicVote,
    onTopicDiscussed: handleTopicDiscussed,
    onStageChange: handleStageChange,
    onTimerChange: handleTimerChange
  });

  useEffect(() => {
    if (board?.id) {
      fetchBoard(board.id);
    }
  }, [board?.id, fetchBoard]);

  const submitTopic = async (event: FormEvent) => {
    event.preventDefault();
    if (!board || !topicTitle.trim()) return;

    try {
      await api.post('/topics', { boardId: board.id, title: topicTitle.trim() });
      setTopicTitle('');
    } catch (err) {
      console.error(err);
      setError('Could not create topic.');
    }
  };

  const voteTopic = (topicId: string) => {
    const socket = getSocket();
    if (!board) return;
    socket.emit('topic:vote', { boardId: board.id, topicId });
  };

  const toggleDiscussed = (topicId: string, discussed: boolean) => {
    const socket = getSocket();
    if (!board) return;
    socket.emit('topic:discussed', { boardId: board.id, topicId, discussed });
  };

  const changeStage = (stage: Stage) => {
    const socket = getSocket();
    if (!board) return;
    socket.emit('board:stage', { boardId: board.id, stage });
  };

  const setTimer = (minutes: number) => {
    const socket = getSocket();
    if (!board) return;
    const timerEnd = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    socket.emit('board:timer', { boardId: board.id, timerEnd });
  };

  const clearTimer = () => {
    const socket = getSocket();
    if (!board) return;
    socket.emit('board:timer', { boardId: board.id, timerEnd: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-insight-light via-white to-insight-light px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold text-insight-primary">Insight Lean Coffee</h1>
          <p className="max-w-2xl text-insight-secondary/80">
            Facilitate engaging, time-boxed discussions with Insight's collaborative Lean Coffee board. Create a board,
            invite your team, and keep the conversation focused with real-time voting, stages, and timers.
          </p>
        </header>

        <section className="grid gap-6 rounded-xl bg-white/80 p-6 shadow-xl md:grid-cols-2">
          <form onSubmit={handleCreateBoard} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-insight-secondary">Create a board</h2>
            <input
              value={boardTitle}
              onChange={(event) => setBoardTitle(event.target.value)}
              className="rounded-md border border-insight-light bg-white px-3 py-2 focus:border-insight-primary focus:outline-none"
              placeholder="Board title"
            />
            <button
              type="submit"
              className="rounded-md bg-insight-primary px-4 py-2 font-semibold text-white shadow hover:bg-insight-secondary"
            >
              Create board
            </button>
          </form>

          <form onSubmit={handleJoinBoard} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-insight-secondary">Join a board</h2>
            <input
              value={boardIdInput}
              onChange={(event) => setBoardIdInput(event.target.value)}
              className="rounded-md border border-insight-light bg-white px-3 py-2 focus:border-insight-primary focus:outline-none"
              placeholder="Enter board ID"
            />
            <button
              type="submit"
              className="rounded-md bg-insight-secondary px-4 py-2 font-semibold text-white shadow hover:bg-insight-primary"
            >
              Join board
            </button>
          </form>
        </section>

        {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>}
        {loading && <div className="text-center text-insight-secondary">Loading board...</div>}

        {board && !loading && (
          <main className="flex flex-col gap-8">
            <section className="flex flex-col gap-4 rounded-xl bg-white/80 p-6 shadow-xl">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-insight-primary">{board.title}</h2>
                  <p className="text-sm text-insight-secondary/70">Share this board ID: {board.id}</p>
                </div>
                <StageControls currentStage={board.stage} onStageChange={changeStage} />
              </div>
              <TimerControls timerEnd={board.timerEnd} onSetTimer={setTimer} onClearTimer={clearTimer} />
            </section>

            <section className="rounded-xl bg-white/80 p-6 shadow-xl">
              <form onSubmit={submitTopic} className="mb-6 flex flex-col gap-3 md:flex-row">
                <input
                  value={topicTitle}
                  onChange={(event) => setTopicTitle(event.target.value)}
                  className="flex-1 rounded-md border border-insight-light bg-white px-3 py-2 focus:border-insight-primary focus:outline-none"
                  placeholder="Add a discussion topic"
                />
                <button
                  type="submit"
                  className="rounded-md bg-insight-primary px-4 py-2 font-semibold text-white shadow hover:bg-insight-secondary"
                >
                  Add topic
                </button>
              </form>

              <TopicList topics={sortedTopics} onVote={voteTopic} onToggleDiscussed={toggleDiscussed} />
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;

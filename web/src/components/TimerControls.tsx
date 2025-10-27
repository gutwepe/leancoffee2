import { useEffect, useMemo, useState } from 'react';

interface TimerControlsProps {
  timerEnd: string | null;
  onSetTimer: (durationMinutes: number) => void;
  onClearTimer: () => void;
}

const TimerControls = ({ timerEnd, onSetTimer, onClearTimer }: TimerControlsProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = useMemo(() => {
    if (!timerEnd) return null;
    const end = new Date(timerEnd).getTime();
    const diff = end - now;
    if (diff <= 0) return '00:00';
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timerEnd, now]);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white/70 p-4 shadow">
      <div>
        <p className="text-sm font-medium text-insight-secondary">Timer</p>
        <p className="text-3xl font-bold text-insight-primary">{remaining ?? '--:--'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[5, 10, 15].map((minutes) => (
          <button
            key={minutes}
            onClick={() => onSetTimer(minutes)}
            className="rounded-md bg-insight-primary px-3 py-1 text-sm font-semibold text-white hover:bg-insight-secondary"
          >
            {minutes} min
          </button>
        ))}
        <button
          onClick={onClearTimer}
          className="rounded-md border border-insight-secondary px-3 py-1 text-sm font-semibold text-insight-secondary hover:bg-insight-secondary hover:text-white"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default TimerControls;

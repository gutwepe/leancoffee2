import { Topic } from '../types';
import { clsx } from 'clsx';

interface TopicListProps {
  topics: Topic[];
  onVote: (topicId: string) => void;
  onToggleDiscussed: (topicId: string, discussed: boolean) => void;
}

const TopicList = ({ topics, onVote, onToggleDiscussed }: TopicListProps) => {
  if (topics.length === 0) {
    return <p className="text-center text-insight-secondary/70">No topics yet. Add one to get started!</p>;
  }

  return (
    <ul className="space-y-3">
      {topics.map((topic) => (
        <li
          key={topic.id}
          className={clsx(
            'rounded-lg border border-white/30 bg-white/60 p-4 shadow-sm transition hover:shadow-lg',
            topic.discussed && 'opacity-70 line-through'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-insight-secondary">{topic.title}</h3>
              <p className="text-sm text-insight-secondary/70">Votes: {topic.votes}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onVote(topic.id)}
                className="rounded-md bg-insight-primary px-3 py-1 text-sm font-medium text-white shadow hover:bg-insight-secondary"
              >
                Upvote
              </button>
              <button
                onClick={() => onToggleDiscussed(topic.id, !topic.discussed)}
                className="rounded-md border border-insight-secondary px-3 py-1 text-sm font-medium text-insight-secondary hover:bg-insight-secondary hover:text-white"
              >
                {topic.discussed ? 'Undo' : 'Discussed'}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TopicList;

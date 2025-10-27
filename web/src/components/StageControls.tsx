import { Stage } from '../types';

const stages: { value: Stage; label: string }[] = [
  { value: 'IDEATION', label: 'Ideation' },
  { value: 'VOTING', label: 'Voting' },
  { value: 'DISCUSSION', label: 'Discussion' },
  { value: 'WRAP_UP', label: 'Wrap-up' }
];

interface StageControlsProps {
  currentStage: Stage;
  onStageChange: (stage: Stage) => void;
}

const StageControls = ({ currentStage, onStageChange }: StageControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {stages.map((stage) => (
        <button
          key={stage.value}
          onClick={() => onStageChange(stage.value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow transition ${
            currentStage === stage.value
              ? 'bg-insight-primary text-white'
              : 'bg-white/70 text-insight-secondary hover:bg-insight-light'
          }`}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
};

export default StageControls;

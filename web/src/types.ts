export type Stage = 'IDEATION' | 'VOTING' | 'DISCUSSION' | 'WRAP_UP';

export interface Topic {
  id: string;
  boardId: string;
  title: string;
  votes: number;
  discussed: boolean;
  createdAt: string;
}

export interface Board {
  id: string;
  title: string;
  stage: Stage;
  timerEnd: string | null;
  topics: Topic[];
}

import type { ComponentType } from 'react';

export type MiniGameId = 'star-catch' | 'potion-brew';

export type MiniGameProps = {
  onComplete: () => void;
  onExit: () => void;
  isCompleted: boolean;
};

export type MiniGameDefinition = {
  id: MiniGameId;
  title: string;
  description: string;
  areaLabel: string;
  component: ComponentType<MiniGameProps>;
};

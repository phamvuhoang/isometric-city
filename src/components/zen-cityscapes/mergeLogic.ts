import { MAX_ZEN_TIER, ZEN_PUZZLE_SIZE } from './zenConfig';

export type ZenGrid = Array<Array<number | null>>;
export type MoveDirection = 'up' | 'down' | 'left' | 'right';

const cloneGrid = (grid: ZenGrid): ZenGrid => grid.map((row) => [...row]);

export const createEmptyGrid = (): ZenGrid =>
  Array.from({ length: ZEN_PUZZLE_SIZE }, () => Array(ZEN_PUZZLE_SIZE).fill(null));

export const addRandomTile = (grid: ZenGrid, baseTier = 1): ZenGrid => {
  const emptyCells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < ZEN_PUZZLE_SIZE; y++) {
    for (let x = 0; x < ZEN_PUZZLE_SIZE; x++) {
      if (grid[y][x] === null) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return grid;
  }

  const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const nextGrid = cloneGrid(grid);
  nextGrid[chosen.y][chosen.x] = Math.min(baseTier, MAX_ZEN_TIER);
  return nextGrid;
};

export const seedGrid = (baseTier = 1, tiles = 2): ZenGrid => {
  let grid = createEmptyGrid();
  for (let i = 0; i < tiles; i++) {
    grid = addRandomTile(grid, baseTier);
  }
  return grid;
};

const mergeLine = (line: number[], maxTier: number) => {
  const merged: Array<number | null> = [];
  const mergedTiers: number[] = [];

  for (let i = 0; i < line.length; i++) {
    if (i < line.length - 1 && line[i] === line[i + 1]) {
      const nextTier = Math.min(line[i] + 1, maxTier);
      merged.push(nextTier);
      mergedTiers.push(nextTier);
      i++;
    } else {
      merged.push(line[i]);
    }
  }

  while (merged.length < ZEN_PUZZLE_SIZE) {
    merged.push(null);
  }

  return { mergedLine: merged, mergedTiers };
};

export const moveGrid = (
  grid: ZenGrid,
  direction: MoveDirection,
  maxTier: number = MAX_ZEN_TIER
): { grid: ZenGrid; mergedTiers: number[]; moved: boolean } => {
  const nextGrid: ZenGrid = createEmptyGrid();
  const mergedTiers: number[] = [];

  if (direction === 'left' || direction === 'right') {
    for (let y = 0; y < ZEN_PUZZLE_SIZE; y++) {
      const row = grid[y].filter((tile) => tile !== null) as number[];
      const workingRow = direction === 'right' ? row.reverse() : row;
      const { mergedLine, mergedTiers: rowMerged } = mergeLine(workingRow, maxTier);
      const finalRow = direction === 'right' ? mergedLine.reverse() : mergedLine;
      nextGrid[y] = finalRow;
      mergedTiers.push(...rowMerged);
    }
  } else {
    for (let x = 0; x < ZEN_PUZZLE_SIZE; x++) {
      const column = grid.map((row) => row[x]).filter((tile) => tile !== null) as number[];
      const workingColumn = direction === 'down' ? column.reverse() : column;
      const { mergedLine, mergedTiers: colMerged } = mergeLine(workingColumn, maxTier);
      const finalColumn = direction === 'down' ? mergedLine.reverse() : mergedLine;
      for (let y = 0; y < ZEN_PUZZLE_SIZE; y++) {
        nextGrid[y][x] = finalColumn[y] ?? null;
      }
      mergedTiers.push(...colMerged);
    }
  }

  let moved = false;
  for (let y = 0; y < ZEN_PUZZLE_SIZE; y++) {
    for (let x = 0; x < ZEN_PUZZLE_SIZE; x++) {
      if (nextGrid[y][x] !== grid[y][x]) {
        moved = true;
        break;
      }
    }
    if (moved) break;
  }

  return { grid: nextGrid, mergedTiers, moved };
};

export const hasMoves = (grid: ZenGrid): boolean => {
  for (let y = 0; y < ZEN_PUZZLE_SIZE; y++) {
    for (let x = 0; x < ZEN_PUZZLE_SIZE; x++) {
      const tile = grid[y][x];
      if (tile === null) return true;
      const right = grid[y][x + 1];
      const down = grid[y + 1]?.[x];
      if (right === tile || down === tile) return true;
    }
  }
  return false;
};

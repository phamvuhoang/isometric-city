'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { MiniGameProps } from '../miniGames';

const GRID_SIZE = 3;
const MAX_TIER = 3;

const INGREDIENTS = [
  { tier: 1, name: 'Moonleaf', style: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100' },
  { tier: 2, name: 'Starberry', style: 'bg-sky-500/20 border-sky-400/40 text-sky-100' },
  { tier: 3, name: 'Celestial Bloom', style: 'bg-violet-500/25 border-violet-400/50 text-violet-100' },
];

type Cell = {
  tier: number;
} | null;

type Coord = { x: number; y: number };

const createEmptyGrid = (): Cell[][] =>
  Array.from({ length: GRID_SIZE }, () => Array<Cell>(GRID_SIZE).fill(null));

const seedGrid = (): Cell[][] => {
  const grid = createEmptyGrid();
  const seeds = 4;
  let placed = 0;
  while (placed < seeds) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (!grid[y][x]) {
      grid[y][x] = { tier: 1 };
      placed += 1;
    }
  }
  return grid;
};

const getRandomEmpty = (grid: Cell[][]): Coord | null => {
  const empty: Coord[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!grid[y][x]) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
};

const isAdjacent = (a: Coord, b: Coord) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export function PotionGame({ onComplete, onExit, isCompleted }: MiniGameProps) {
  const [grid, setGrid] = useState<Cell[][]>(() => seedGrid());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [message, setMessage] = useState('Combine matching herbs to brew a luminous potion.');

  const hasBloom = useMemo(
    () => grid.some((row) => row.some((cell) => cell?.tier === MAX_TIER)),
    [grid]
  );

  useEffect(() => {
    if (isCompleted || hasBloom) {
      setMessage('The tonic glows with spirit light.');
    }
  }, [hasBloom, isCompleted]);

  useEffect(() => {
    if (!isCompleted && hasBloom) {
      onComplete();
    }
  }, [hasBloom, isCompleted, onComplete]);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const cell = grid[y][x];
      if (!cell) return;

      if (!selected) {
        setSelected({ x, y });
        return;
      }

      if (selected.x === x && selected.y === y) {
        setSelected(null);
        return;
      }

      if (!isAdjacent(selected, { x, y })) {
        setSelected({ x, y });
        return;
      }

      const selectedCell = grid[selected.y][selected.x];
      if (!selectedCell || selectedCell.tier !== cell.tier) {
        setSelected({ x, y });
        return;
      }

      const nextTier = Math.min(cell.tier + 1, MAX_TIER);
      const nextGrid = grid.map((row) => row.map((entry) => (entry ? { ...entry } : null)));
      nextGrid[y][x] = { tier: nextTier };
      nextGrid[selected.y][selected.x] = null;

      const spawn = getRandomEmpty(nextGrid);
      if (spawn) {
        nextGrid[spawn.y][spawn.x] = { tier: 1 };
      }

      setGrid(nextGrid);
      setSelected(null);
    },
    [grid, selected]
  );

  const ingredientFor = (tier: number) => INGREDIENTS[tier - 1];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{message}</div>
      <div className="grid grid-cols-3 gap-3">
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isSelected = selected?.x === x && selected?.y === y;
            if (!cell) {
              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  className="aspect-square rounded-sm border border-dashed border-slate-700/60 bg-slate-950/40"
                />
              );
            }
            const ingredient = ingredientFor(cell.tier);
            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => handleCellClick(x, y)}
                className={`aspect-square rounded-sm border ${ingredient.style} flex flex-col items-center justify-center text-center text-xs font-semibold transition-transform ${
                  isSelected ? 'scale-105 shadow-lg shadow-primary/20' : 'hover:scale-105'
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Tier {cell.tier}
                </span>
                <span>{ingredient.name}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="rounded-sm border border-primary/20 bg-slate-950/60 px-3 py-2 text-xs text-slate-200/70">
        Tap adjacent matching ingredients to fuse them. Keep combining until the
        Celestial Bloom appears.
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onExit}>
          Return to Village
        </Button>
      </div>
    </div>
  );
}

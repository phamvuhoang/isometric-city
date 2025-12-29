'use client';

import React, { useRef } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTierInfo, MAX_ZEN_TIER } from './zenConfig';
import type { MoveDirection, ZenGrid } from './mergeLogic';

const SWIPE_THRESHOLD = 32;

type MergePuzzleProps = {
  grid: ZenGrid;
  onMove: (direction: MoveDirection) => void;
  onRefresh: () => void;
  statusMessage: string | null;
  isStuck: boolean;
};

export function MergePuzzle({ grid, onMove, onRefresh, statusMessage, isStuck }: MergePuzzleProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD) {
      touchStartRef.current = null;
      return;
    }

    if (absX > absY) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }

    touchStartRef.current = null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-blue">Merge Atelier</CardTitle>
        <p className="text-xs text-muted-foreground">
          Merge matching tiles to grow new buildings. Swipes, arrow keys, and
          the compass all work.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusMessage ? (
          <div className="rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            {statusMessage}
          </div>
        ) : null}
        <div
          className="grid grid-cols-4 gap-3 rounded-sm border border-sidebar-border bg-slate-950/40 p-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              if (tile === null) {
                return (
                  <div
                    key={key}
                    className="aspect-square rounded-sm border border-slate-800/70 bg-slate-950/40"
                  />
                );
              }
              const tierInfo = getTierInfo(tile);
              return (
                <div
                  key={key}
                  className={`aspect-square rounded-sm border ${tierInfo.tileClass} flex flex-col items-center justify-center text-center shadow-inner`}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Tier {Math.min(tile, MAX_ZEN_TIER)}
                  </div>
                  <div className="px-2 text-xs font-semibold leading-tight sm:text-sm">
                    {tierInfo.name}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div />
          <Button
            variant="secondary"
            size="icon"
            aria-label="Move up"
            onClick={() => onMove('up')}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <div />
          <Button
            variant="secondary"
            size="icon"
            aria-label="Move left"
            onClick={() => onMove('left')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Move down"
            onClick={() => onMove('down')}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Move right"
            onClick={() => onMove('right')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-sm border border-sidebar-border bg-slate-950/30 px-3 py-2 text-xs text-muted-foreground">
          <span>
            {isStuck
              ? 'Board is calm and full. Refresh to keep merging.'
              : 'Relaxed pace, no timers.'}
          </span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh Puzzle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

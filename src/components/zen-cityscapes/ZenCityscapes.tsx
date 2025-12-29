'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCcw, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CanvasIsometricGrid } from '@/components/game/CanvasIsometricGrid';
import { useGame } from '@/context/GameContext';
import { useMobile } from '@/hooks/useMobile';
import { MergePuzzle } from './MergePuzzle';
import { addRandomTile, hasMoves, moveGrid, seedGrid, type MoveDirection, type ZenGrid } from './mergeLogic';
import { getTierInfo, MAX_ZEN_TIER, ZEN_BUILDING_TIERS, ZEN_CITY_GRID_SIZE } from './zenConfig';

const STATUS_DURATION_MS = 2200;

type CityPlacement = {
  x: number;
  y: number;
  tier: number;
};

export function ZenCityscapes() {
  const {
    latestStateRef,
    setSpeed,
    setTool,
    setDisastersEnabled,
    newGame,
    hasExistingGame,
    isStateReady,
    placeBuildingInstant,
  } = useGame();
  const { isMobileDevice, isSmallScreen } = useMobile();
  const isMobile = isMobileDevice || isSmallScreen;

  const [puzzleGrid, setPuzzleGrid] = useState<ZenGrid>(() => seedGrid());
  const [unlockedTier, setUnlockedTier] = useState(1);
  const [lastMergeTier, setLastMergeTier] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [placements, setPlacements] = useState<CityPlacement[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);

  const gridRef = useRef(puzzleGrid);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unlockedTierInfo = useMemo(() => getTierInfo(unlockedTier), [unlockedTier]);

  useEffect(() => {
    gridRef.current = puzzleGrid;
    setIsStuck(!hasMoves(puzzleGrid));
  }, [puzzleGrid]);

  useEffect(() => {
    if (!isStateReady) return;

    setSpeed(0);
    setTool('select');
    setDisastersEnabled(false);

    if (!hasExistingGame) {
      newGame('Zen Cityscapes', ZEN_CITY_GRID_SIZE);
    }
  }, [hasExistingGame, isStateReady, newGame, setDisastersEnabled, setSpeed, setTool]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const announceStatus = useCallback((message: string) => {
    setStatusMessage(message);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage(null);
    }, STATUS_DURATION_MS);
  }, []);

  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(392, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.65);
  }, [soundEnabled]);

  const resetPuzzle = useCallback((resetUnlocks: boolean) => {
    const freshGrid = seedGrid();
    gridRef.current = freshGrid;
    setPuzzleGrid(freshGrid);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setStatusMessage(null);
    setLastMergeTier(null);
    if (resetUnlocks) {
      setUnlockedTier(1);
    }
  }, []);

  const resetCity = useCallback(() => {
    newGame('Zen Cityscapes', ZEN_CITY_GRID_SIZE);
    setSpeed(0);
    setTool('select');
    setDisastersEnabled(false);
    setPlacements([]);
    setSelectedTile(null);
    resetPuzzle(true);
  }, [newGame, resetPuzzle, setDisastersEnabled, setSpeed, setTool]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && !audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      return next;
    });
  }, []);

  const collectOpenTiles = useCallback(
    (placementsSnapshot: CityPlacement[]) => {
      const openTiles: Array<{ x: number; y: number }> = [];
      const occupied = new Set(placementsSnapshot.map((placement) => `${placement.x},${placement.y}`));
      const grid = latestStateRef.current.grid;

      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          if (occupied.has(`${x},${y}`)) continue;
          const tile = grid[y][x];
          if (tile.building.type === 'grass' || tile.building.type === 'tree') {
            openTiles.push({ x, y });
          }
        }
      }

      return openTiles;
    },
    [latestStateRef]
  );

  const applyCityGrowth = useCallback(
    (mergedTiers: number[]) => {
      if (mergedTiers.length === 0) return;

      setPlacements((prev) => {
        let nextPlacements = [...prev];

        mergedTiers.forEach((tier) => {
          const clampedTier = Math.min(tier, MAX_ZEN_TIER);
          const tierInfo = getTierInfo(clampedTier);
          const upgradeIndex = nextPlacements.findIndex(
            (placement) => placement.tier === clampedTier - 1
          );

          if (upgradeIndex >= 0) {
            const target = nextPlacements[upgradeIndex];
            nextPlacements[upgradeIndex] = { ...target, tier: clampedTier };
            placeBuildingInstant(target.x, target.y, tierInfo.buildingType);
            return;
          }

          const openTiles = collectOpenTiles(nextPlacements);
          if (openTiles.length > 0) {
            const target = openTiles[Math.floor(Math.random() * openTiles.length)];
            placeBuildingInstant(target.x, target.y, tierInfo.buildingType);
            nextPlacements = [...nextPlacements, { ...target, tier: clampedTier }];
            return;
          }

          if (nextPlacements.length > 0) {
            const lowestIndex = nextPlacements.reduce((lowest, placement, index) => {
              if (placement.tier < nextPlacements[lowest].tier) return index;
              return lowest;
            }, 0);
            const target = nextPlacements[lowestIndex];
            nextPlacements[lowestIndex] = { ...target, tier: clampedTier };
            placeBuildingInstant(target.x, target.y, tierInfo.buildingType);
          }
        });

        return nextPlacements;
      });
    },
    [collectOpenTiles, placeBuildingInstant]
  );

  const handleMergeEvents = useCallback(
    (mergedTiers: number[]) => {
      if (mergedTiers.length === 0) return;

      const maxMerged = Math.max(...mergedTiers);
      const clampedMax = Math.min(maxMerged, MAX_ZEN_TIER);
      const tierInfo = getTierInfo(clampedMax);

      setLastMergeTier(clampedMax);
      setUnlockedTier((prev) => Math.max(prev, clampedMax));

      if (clampedMax > unlockedTier) {
        announceStatus(`New building unlocked: ${tierInfo.name}.`);
        playChime();
      } else {
        announceStatus(`Merge blooms into ${tierInfo.name}.`);
      }

      applyCityGrowth(mergedTiers);
    },
    [announceStatus, applyCityGrowth, playChime, unlockedTier]
  );

  const handleMove = useCallback(
    (direction: MoveDirection) => {
      const { grid: movedGrid, mergedTiers, moved } = moveGrid(gridRef.current, direction);
      if (!moved) return;

      const nextGrid = addRandomTile(movedGrid);
      gridRef.current = nextGrid;
      setPuzzleGrid(nextGrid);
      handleMergeEvents(mergedTiers);
    },
    [handleMergeEvents]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const keyMap: Record<string, MoveDirection> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = keyMap[key];
      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-4 pb-10 pt-8 text-foreground sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="border border-sidebar-border/80">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-blue text-2xl">Zen Cityscapes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A slow merge ritual that paints a calm isometric skyline.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => resetPuzzle(false)}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh Puzzle
                </Button>
                <Button variant="secondary" size="sm" onClick={resetCity}>
                  New City
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSound}
                  aria-label="Toggle ambient chime"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                Unlocked: {unlockedTierInfo.name}
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-muted-foreground">
                City builds: {placements.length}
              </Badge>
              {lastMergeTier ? (
                <Badge variant="outline" className="border-primary/30 text-muted-foreground">
                  Last merge: {getTierInfo(lastMergeTier).name}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {ZEN_BUILDING_TIERS.map((tier) => (
                <Badge
                  key={tier.tier}
                  variant={tier.tier <= unlockedTier ? 'default' : 'outline'}
                  className={
                    tier.tier <= unlockedTier
                      ? 'border border-primary/30 bg-primary/15 text-primary'
                      : 'border border-slate-700/60 text-muted-foreground'
                  }
                >
                  {tier.name}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <MergePuzzle
            grid={puzzleGrid}
            onMove={handleMove}
            onRefresh={() => resetPuzzle(false)}
            statusMessage={statusMessage}
            isStuck={isStuck}
          />

          <Card className="flex h-full flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue text-xl">City Canvas</CardTitle>
              <p className="text-xs text-muted-foreground">
                Each merge paints a new tier onto the skyline.
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="relative h-[380px] w-full overflow-hidden rounded-sm border border-sidebar-border bg-slate-950/30 sm:h-[480px] lg:h-[560px]">
                <CanvasIsometricGrid
                  overlayMode="none"
                  selectedTile={selectedTile}
                  setSelectedTile={setSelectedTile}
                  isMobile={isMobile}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

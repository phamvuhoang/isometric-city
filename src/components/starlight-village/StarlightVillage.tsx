'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CanvasIsometricGrid } from '@/components/game/CanvasIsometricGrid';
import { useGame } from '@/context/GameContext';
import { useMobile } from '@/hooks/useMobile';
import { gridToScreen } from '@/components/game/utils';
import { TILE_HEIGHT, TILE_WIDTH } from '@/components/game/types';
import { getBuildingSize } from '@/lib/simulation';
import { MiniGameOverlay } from './MiniGameOverlay';
import { StarCatchGame } from './games/StarCatchGame';
import { PotionGame } from './games/PotionGame';
import type { MiniGameDefinition, MiniGameId } from './miniGames';
import { VILLAGE_BUILDINGS, VILLAGE_GRID_SIZE, VILLAGE_HOTSPOTS } from './villageLayout';

const STORAGE_KEY = 'starlight-village-progress';

type Viewport = {
  offset: { x: number; y: number };
  zoom: number;
  canvasSize: { width: number; height: number };
};

export function StarlightVillage() {
  const {
    state,
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

  const miniGames = useMemo<MiniGameDefinition[]>(
    () => [
      {
        id: 'star-catch',
        title: 'Falling Stars',
        description: 'Catch drifting starlight with Lyra at the plaza.',
        areaLabel: 'Moonlit Plaza',
        component: StarCatchGame,
      },
      {
        id: 'potion-brew',
        title: 'Spirit Potion',
        description: 'Combine herbs until a celestial bloom appears.',
        areaLabel: 'Spirit Apothecary',
        component: PotionGame,
      },
    ],
    []
  );

  const gamesById = useMemo(
    () => Object.fromEntries(miniGames.map((game) => [game.id, game])),
    [miniGames]
  );

  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [activeGameId, setActiveGameId] = useState<MiniGameId | null>(null);
  const [completedGames, setCompletedGames] = useState<Record<MiniGameId, boolean>>({
    'star-catch': false,
    'potion-brew': false,
  });
  const [layoutInitialized, setLayoutInitialized] = useState(false);

  const completedCount = miniGames.filter((game) => completedGames[game.id]).length;
  const lightLevel = Math.round((completedCount / miniGames.length) * 100);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<MiniGameId, boolean>;
        setCompletedGames((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore malformed saves.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedGames));
  }, [completedGames]);

  useEffect(() => {
    if (!isStateReady) return;
    setSpeed(0);
    setTool('select');
    setDisastersEnabled(false);

    if (!hasExistingGame) {
      newGame('Starlight Village', VILLAGE_GRID_SIZE);
    }
  }, [hasExistingGame, isStateReady, newGame, setDisastersEnabled, setSpeed, setTool]);

  useEffect(() => {
    if (!isStateReady) return;
    if (hasExistingGame) {
      setLayoutInitialized(true);
      return;
    }
    if (layoutInitialized) return;
    if (state.gridSize !== VILLAGE_GRID_SIZE) return;

    const grid = state.grid;
    const gridSize = state.gridSize;

    const isBuildable = (x: number, y: number) => {
      const tile = grid[y]?.[x];
      if (!tile) return false;
      return tile.building.type === 'grass' || tile.building.type === 'tree';
    };

    const canPlaceFootprint = (x: number, y: number, width: number, height: number) => {
      if (x + width > gridSize || y + height > gridSize) return false;
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          if (!isBuildable(x + dx, y + dy)) return false;
        }
      }
      return true;
    };

    const findPlacement = (x: number, y: number, width: number, height: number) => {
      const maxRadius = 6;
      for (let radius = 0; radius <= maxRadius; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const candidateX = x + dx;
            const candidateY = y + dy;
            if (candidateX < 0 || candidateY < 0) continue;
            if (canPlaceFootprint(candidateX, candidateY, width, height)) {
              return { x: candidateX, y: candidateY };
            }
          }
        }
      }
      return null;
    };

    VILLAGE_BUILDINGS.forEach((building) => {
      const size = getBuildingSize(building.type);
      const placement = findPlacement(building.x, building.y, size.width, size.height);
      if (!placement) return;
      placeBuildingInstant(placement.x, placement.y, building.type);
    });

    setLayoutInitialized(true);
  }, [hasExistingGame, isStateReady, layoutInitialized, placeBuildingInstant, state.grid, state.gridSize]);

  const openGame = useCallback((gameId: MiniGameId) => {
    setActiveGameId(gameId);
    setSelectedTile(null);
  }, []);

  const closeGame = useCallback(() => {
    setActiveGameId(null);
  }, []);

  const handleComplete = useCallback((gameId: MiniGameId) => {
    setCompletedGames((prev) => ({ ...prev, [gameId]: true }));
  }, []);

  useEffect(() => {
    if (!selectedTile) return;
    const hotspot = VILLAGE_HOTSPOTS.find(
      (spot) => spot.x === selectedTile.x && spot.y === selectedTile.y
    );
    if (hotspot) {
      openGame(hotspot.gameId);
    }
  }, [openGame, selectedTile]);

  const activeGame = activeGameId ? gamesById[activeGameId] : null;

  const getScreenPosition = useCallback(
    (x: number, y: number) => {
      if (!viewport) return null;
      const { screenX, screenY } = gridToScreen(x, y, 0, 0);
      return {
        left: screenX * viewport.zoom + viewport.offset.x + (TILE_WIDTH * viewport.zoom) / 2,
        top: screenY * viewport.zoom + viewport.offset.y + (TILE_HEIGHT * viewport.zoom) / 2,
      };
    },
    [viewport]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-4 pb-12 pt-8 text-foreground sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="border border-sidebar-border/80">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-blue text-2xl">Starlight Village</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A cozy night village where each gentle game rekindles a glow.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  Light Level: {lightLevel}%
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-muted-foreground">
                  Areas Lit: {completedCount}/{miniGames.length}
                </Badge>
              </div>
            </div>
            <Progress value={lightLevel} className="h-2 bg-slate-900" />
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue text-xl">Spirit Journal</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tap a spirit or replay a game to keep the village glowing.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {miniGames.map((game) => {
                const isLit = completedGames[game.id];
                return (
                  <div
                    key={game.id}
                    className="flex flex-col gap-2 rounded-sm border border-primary/20 bg-slate-950/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className={isLit ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-muted-foreground'} />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{game.areaLabel}</div>
                          <div className="text-xs text-muted-foreground">{game.description}</div>
                        </div>
                      </div>
                      <Badge
                        variant={isLit ? 'default' : 'outline'}
                        className={isLit ? 'bg-primary/20 text-primary' : 'border-slate-700/60 text-muted-foreground'}
                      >
                        {isLit ? 'Lit' : 'Dark'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openGame(game.id)}>
                      {isLit ? 'Replay' : 'Begin'}
                    </Button>
                  </div>
                );
              })}
              <div className="rounded-sm border border-primary/20 bg-slate-950/60 px-3 py-2 text-xs text-muted-foreground">
                <Wand2 className="mb-1 h-4 w-4 text-primary" />
                Each completed ritual lights up its corner of the village.
                <br />
                TODO(starlight-village): Add ambient music + particle sparkle overlay.
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue text-xl">Village at Night</CardTitle>
              <p className="text-xs text-muted-foreground">
                Click a spirit to begin their story.
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="relative h-[420px] w-full overflow-hidden rounded-sm border border-sidebar-border bg-slate-950/30 sm:h-[520px]">
                <CanvasIsometricGrid
                  overlayMode="none"
                  selectedTile={selectedTile}
                  setSelectedTile={setSelectedTile}
                  isMobile={isMobile}
                  onViewportChange={setViewport}
                />
                <div className="pointer-events-none absolute inset-0">
                  {VILLAGE_HOTSPOTS.map((spot) => {
                    const pos = getScreenPosition(spot.x, spot.y);
                    if (!pos) return null;
                    const isLit = completedGames[spot.gameId];
                    return (
                      <div key={spot.id} className="absolute" style={{ left: pos.left, top: pos.top }}>
                        <div
                          className={`pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-b ${spot.glowClass} ${
                            isLit ? 'opacity-100 blur-xl' : 'opacity-40 blur-lg'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => openGame(spot.gameId)}
                          className={`pointer-events-auto relative flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-semibold transition ${
                            isLit
                              ? 'border-primary/40 bg-primary/20 text-primary shadow-lg shadow-primary/20'
                              : 'border-slate-700/70 bg-slate-950/80 text-slate-200'
                          } animate-float`}
                        >
                          ✦
                        </button>
                        <div className="pointer-events-none mt-1 -translate-x-1/2 text-center text-[10px] text-slate-200/80">
                          {spot.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MiniGameOverlay
        open={!!activeGame}
        title={activeGame?.title ?? ''}
        description={activeGame?.description ?? ''}
        onClose={closeGame}
      >
        {activeGame ? (
          <activeGame.component
            onComplete={() => handleComplete(activeGame.id)}
            onExit={closeGame}
            isCompleted={completedGames[activeGame.id]}
          />
        ) : null}
      </MiniGameOverlay>
    </div>
  );
}

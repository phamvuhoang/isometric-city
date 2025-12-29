'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { MiniGameProps } from '../miniGames';

const TARGET_SCORE = 6;
const STAR_SPAWN_INTERVAL = 1.2;

export function StarCatchGame({ onComplete, onExit, isCompleted }: MiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const completedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Catch drifting stars to light the plaza.');
  const scoreRef = useRef(0);

  const playerRef = useRef({ x: 0, y: 0, baseY: 0, lift: 0 });
  const starsRef = useRef<{ x: number; y: number; speed: number; radius: number }[]>([]);
  const keysRef = useRef({ left: false, right: false });

  const updateMessage = useCallback(() => {
    if (isCompleted || completedRef.current) {
      setMessage('The plaza glows brighter.');
      return;
    }
    setMessage(`Catch ${TARGET_SCORE} stars to kindle the lanterns.`);
  }, [isCompleted]);

  useEffect(() => {
    updateMessage();
  }, [updateMessage]);

  useEffect(() => {
    if (isCompleted) {
      completedRef.current = true;
      setMessage('The plaza glows brighter.');
    }
  }, [isCompleted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keysRef.current.left = true;
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keysRef.current.right = true;
      }
      if (event.key === ' ' || event.key === 'ArrowUp') {
        playerRef.current.lift = 0.45;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keysRef.current.left = false;
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const scale = window.devicePixelRatio;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      playerRef.current.x = rect.width / 2;
      playerRef.current.baseY = rect.height - 48;
      playerRef.current.y = playerRef.current.baseY;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = (time: number) => {
      const dt = Math.min(0.033, (time - lastTimeRef.current) / 1000 || 0);
      lastTimeRef.current = time;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(0, 0, width, height);

      spawnTimerRef.current += dt;
      if (spawnTimerRef.current >= STAR_SPAWN_INTERVAL) {
        spawnTimerRef.current = 0;
        starsRef.current.push({
          x: Math.random() * (width - 80) + 40,
          y: -20,
          speed: 30 + Math.random() * 20,
          radius: 6 + Math.random() * 4,
        });
      }

      const player = playerRef.current;
      const speed = 160;
      const direction = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
      player.x += direction * speed * dt;
      player.x = Math.max(28, Math.min(width - 28, player.x));

      if (player.lift > 0) {
        player.lift = Math.max(0, player.lift - dt);
        const liftProgress = player.lift / 0.45;
        player.y = player.baseY - liftProgress * 40;
      } else {
        player.y = player.baseY;
      }

      const updatedStars: typeof starsRef.current = [];
      let hits = 0;

      starsRef.current.forEach((star) => {
        star.y += star.speed * dt;
        const dx = star.x - player.x;
        const dy = star.y - player.y;
        if (Math.hypot(dx, dy) < star.radius + 18) {
          hits += 1;
          return;
        }
        if (star.y < height + 40) {
          updatedStars.push(star);
        }
      });

      if (hits > 0) {
        scoreRef.current += hits;
        setScore(scoreRef.current);
      }

      starsRef.current = updatedStars;

      ctx.fillStyle = 'rgba(226, 232, 240, 0.12)';
      ctx.beginPath();
      ctx.arc(player.x, player.y + 8, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y - 6, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(125, 211, 252, 0.9)';
      starsRef.current.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!completedRef.current && scoreRef.current >= TARGET_SCORE) {
        completedRef.current = true;
        onComplete();
        setMessage('Lanterns awaken with starlight.');
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{message}</span>
        <span className="font-semibold text-primary">{score}/{TARGET_SCORE}</span>
      </div>
      <div
        className="relative h-72 w-full overflow-hidden rounded-sm border border-primary/20"
        onPointerDown={() => {
          playerRef.current.lift = 0.45;
        }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-slate-200/70">
          Move with arrow keys or A/D. Tap to float up.
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onExit}>
          Return to Village
        </Button>
      </div>
    </div>
  );
}

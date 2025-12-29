'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MiniGameOverlayProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function MiniGameOverlay({ open, title, description, onClose, children }: MiniGameOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="w-full max-w-2xl animate-fadeIn rounded-sm border border-primary/30 bg-slate-950/95 shadow-xl">
        <div className="flex items-start justify-between border-b border-primary/20 px-6 py-4">
          <div>
            <h2 className="font-display text-xl text-blue">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close mini-game">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

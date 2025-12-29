import { GameProvider } from '@/context/GameContext';
import { ZenCityscapes } from '@/components/zen-cityscapes/ZenCityscapes';

export default function ZenCityscapesPage() {
  return (
    <GameProvider storageKeyPrefix="zen-cityscapes">
      <ZenCityscapes />
    </GameProvider>
  );
}

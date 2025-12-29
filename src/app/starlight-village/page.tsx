import { GameProvider } from '@/context/GameContext';
import { StarlightVillage } from '@/components/starlight-village/StarlightVillage';

export default function StarlightVillagePage() {
  return (
    <GameProvider storageKeyPrefix="starlight-village">
      <StarlightVillage />
    </GameProvider>
  );
}

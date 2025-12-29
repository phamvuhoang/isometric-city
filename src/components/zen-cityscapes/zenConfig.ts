import { BuildingType } from '@/types/game';

export const ZEN_PUZZLE_SIZE = 4;
export const ZEN_CITY_GRID_SIZE = 20;

export type ZenTierInfo = {
  tier: number;
  name: string;
  buildingType: BuildingType;
  tileClass: string;
};

export const ZEN_BUILDING_TIERS: ZenTierInfo[] = [
  {
    tier: 1,
    name: 'Sprout',
    buildingType: 'tree',
    tileClass: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100',
  },
  {
    tier: 2,
    name: 'Cabin',
    buildingType: 'cabin_house',
    tileClass: 'bg-teal-500/15 border-teal-400/30 text-teal-100',
  },
  {
    tier: 3,
    name: 'Cottage',
    buildingType: 'house_small',
    tileClass: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-100',
  },
  {
    tier: 4,
    name: 'Townhouse',
    buildingType: 'house_medium',
    tileClass: 'bg-sky-500/15 border-sky-400/30 text-sky-100',
  },
  {
    tier: 5,
    name: 'Corner Shop',
    buildingType: 'shop_small',
    tileClass: 'bg-blue-500/15 border-blue-400/30 text-blue-100',
  },
  {
    tier: 6,
    name: 'Market Hall',
    buildingType: 'shop_medium',
    tileClass: 'bg-amber-500/15 border-amber-400/30 text-amber-100',
  },
  {
    tier: 7,
    name: 'Studio Office',
    buildingType: 'office_building_small',
    tileClass: 'bg-orange-500/15 border-orange-400/30 text-orange-100',
  },
  {
    tier: 8,
    name: 'Community Hall',
    buildingType: 'community_center',
    tileClass: 'bg-rose-500/15 border-rose-400/30 text-rose-100',
  },
];

export const MAX_ZEN_TIER = ZEN_BUILDING_TIERS.length;

export const getTierInfo = (tier: number): ZenTierInfo => {
  const clampedTier = Math.min(Math.max(tier, 1), MAX_ZEN_TIER);
  return ZEN_BUILDING_TIERS[clampedTier - 1];
};

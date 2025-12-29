import { BuildingType } from '@/types/game';

export const VILLAGE_GRID_SIZE = 18;

export type VillageBuilding = {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  label?: string;
};

export type VillageHotspot = {
  id: string;
  gameId: 'star-catch' | 'potion-brew';
  label: string;
  description: string;
  x: number;
  y: number;
  glowClass: string;
};

export const VILLAGE_BUILDINGS: VillageBuilding[] = [
  { id: 'elder-tree', type: 'park_large', x: 2, y: 3, label: 'Elder Tree' },
  { id: 'observatory', type: 'space_program', x: 11, y: 2, label: 'Observatory' },
  { id: 'plaza', type: 'park', x: 8, y: 8, label: 'Moonlit Plaza' },
  { id: 'spirit-hall', type: 'community_center', x: 6, y: 11, label: 'Spirit Hall' },
  { id: 'cabin-1', type: 'cabin_house', x: 5, y: 9 },
  { id: 'cabin-2', type: 'house_small', x: 9, y: 9 },
  { id: 'cottage', type: 'house_medium', x: 10, y: 7 },
  { id: 'market', type: 'shop_small', x: 7, y: 6 },
  { id: 'garden', type: 'community_garden', x: 5, y: 12 },
  { id: 'pond', type: 'pond_park', x: 8, y: 11 },
  { id: 'gate', type: 'park_gate', x: 4, y: 7 },
  { id: 'trail', type: 'mountain_trailhead', x: 13, y: 10 },
  { id: 'lodge', type: 'mountain_lodge', x: 12, y: 12 },
  { id: 'greens', type: 'greenhouse_garden', x: 9, y: 12 },
  { id: 'camp', type: 'campground', x: 3, y: 12 },
  { id: 'tree-1', type: 'tree', x: 3, y: 8 },
  { id: 'tree-2', type: 'tree', x: 4, y: 9 },
  { id: 'tree-3', type: 'tree', x: 12, y: 8 },
  { id: 'tree-4', type: 'tree', x: 13, y: 9 },
];

export const VILLAGE_HOTSPOTS: VillageHotspot[] = [
  {
    id: 'plaza-stars',
    gameId: 'star-catch',
    label: 'Plaza of Falling Stars',
    description: 'Help Lyra catch the drifting starlight.',
    x: 8,
    y: 8,
    glowClass: 'from-sky-400/40 via-sky-200/20 to-transparent',
  },
  {
    id: 'spirit-brew',
    gameId: 'potion-brew',
    label: 'Spirit Apothecary',
    description: 'Blend moon herbs into a glowing tonic.',
    x: 6,
    y: 11,
    glowClass: 'from-emerald-400/40 via-emerald-200/20 to-transparent',
  },
];

// TODO(starlight-village): Add more village props and a third mini-game hotspot.

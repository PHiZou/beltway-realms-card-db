export type CardType = 'quest' | 'dialogue' | 'skill' | 'insight' | 'event' | 'artifact';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Ability = 'clout' | 'hustle' | 'standing' | 'cunning' | 'insight' | 'influence';
export type ActionType = 'action' | 'bonus' | 'reaction' | 'passive';
export type Recharge = 'at-will' | 'short-rest' | 'long-rest' | 'one-shot';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  region_id: string | null;
  modifier: number;
  clout: number;
  hustle: number;
  standing: number;
  cunning: number;
  insight: number;
  influence: number;
  primary_ability: Ability;
  action_type: ActionType;
  recharge: Recharge;
  flavor: string | null;
  description: string;
  unlock_method: string | null;
  image_url: string | null;
  created_at: string;
  tags?: string[];
}

export interface Region {
  id: string;
  name: string;
  theme: string | null;
  color: string | null;
}

export interface CardVariant {
  id: string;
  base_card_id: string;
  variant_name: string;
  modifier_delta: number;
  special_effect: string | null;
  created_at: string;
}

export interface CardRating {
  id: number;
  card_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CardUsageStats {
  card_id: string;
  times_played: number;
  times_won: number;
  avg_roll_with: number | null;
  popular_rank: number | null;
}

export interface Loadout {
  id: string;
  name: string;
  description: string | null;
  card_ids: string;
  total_modifier: number;
  synergy_bonus: number;
  created_at: string;
}

export interface CardFilter {
  type?: CardType;
  rarity?: Rarity[];
  region?: string;
  modifier_min?: number;
  modifier_max?: number;
  tags?: string[];
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CARD_TYPES: CardType[] = ['quest', 'dialogue', 'skill', 'insight', 'event', 'artifact'];
export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

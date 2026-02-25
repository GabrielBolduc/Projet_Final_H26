export enum UnitType {
  SimpleRoom = 'SimpleRoom',
  DoubleRoom = 'DoubleRoom',
  FamilyRoom = 'FamilyRoom',
  SmallTerrain = 'SmallTerrain',
  StandardTerrain = 'StandardTerrain',
  DeluxeTerrain = 'DeluxeTerrain'
}

export type FoodOption = 'None' | 'Canteen' | 'Room service' | 'Restaurant';

export interface Unit {
  id?: number;
  cost_person_per_night: number;
  type: UnitType;
  quantity: number;
  wifi: boolean;
  water: number;
  electricity: boolean;
  parking_cost: number;
  food_options: FoodOption[];
  accommodation_id: number;
  image_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

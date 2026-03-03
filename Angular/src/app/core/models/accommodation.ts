import { Unit } from './unit';

export enum AccommodationCategory {
  Camping = 0,
  Hotel = 1
}

export interface SSFFilters {
  category?: AccommodationCategory | 'all';
  name?: string;
  max_distance?: number
  wifi?: boolean;
  water?: string;
  electricity?: boolean;
  type?: string;
  max_price?: number;
  min_people?: number;
}

export interface Accommodation {
  id: number;
  name: string;
  category: AccommodationCategory;
  address: string;
  latitude: number;
  longitude: number;
  shuttle: boolean;
  time_car: string;
  time_walk: string;
  commission: number;
  festival_id: number;
  units?: Unit[];
  created_at?: Date;
  updated_at?: Date;
}

export interface AccommodationWithImage extends Accommodation {
  displayImage: string;
}

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

//STATISTIQUES

export interface AccommodationStats {
  id: number;
  festival_id: number;
  name: string;
  category: AccommodationCategory;
  unit_count: number;
  pricing: {
    avg_nightly_rate: number;
    avg_parking_fee: number;
  };
  services: {
    wifi: string;
    electricity: string;
    water: string;
    parking: string;
  };
  location: {
    address: string;
    distance_km: number;
  };
  finance: {
    total_revenue: number;
    actual_profit: number;
    commission_rate: string;
  };
  inventory: {
    total_units: number;
    available_now: number;
  };
}

export interface FestivalEditionData {
  items: AccommodationStats[];
  highlights: {
    top: { name: string; finance: any };
    bottom: { name: string; finance: any };
  };
}

export type GroupedAccommodationStats = { [festivalName: string]: FestivalEditionData };

export interface AccommodationStatsResponse {
  status: string;
  highlights: {
    highest_earner: { name: string; finance: any };
    lowest_earner: { name: string; finance: any };
  };
  data: GroupedAccommodationStats;
}
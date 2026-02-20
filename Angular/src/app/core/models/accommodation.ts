export enum AccommodationCategory {
  Hotel = 0,
  Camping = 1
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
  created_at?: Date;
  updated_at?: Date;
}
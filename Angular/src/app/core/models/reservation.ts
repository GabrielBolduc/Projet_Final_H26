export interface Reservation {
  id?: number;
  status: 'active' | 'cancelled' | 'completed';
  
  arrival_at: string | Date; 
  departure_at: string | Date;
  
  nb_of_people: number;
  
  reservation_name: string;
  phone_number: string;
  
  user_id: number;
  unit_id: number;
  festival_id: number;

  created_at?: string | Date;
  updated_at?: string | Date;
  unit?: {
    id: number;    
    accommodation_id: number;
    type: string;
    image_url: string;
    cost_person_per_night: number;
    accommodation?: {
      id: number; 
      name: string;
      address: string;
      category: string;
      latitude: number | string;
      longitude: number | string;
    }
  };
}
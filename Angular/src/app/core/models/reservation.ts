export interface Reservation {
  id?: number;
  
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
}
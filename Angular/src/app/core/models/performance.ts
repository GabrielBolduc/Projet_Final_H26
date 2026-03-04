import { Artist } from './artist';
import { Stage } from './stage';
import { Festival } from './festival';

export interface Performance {
  id?: number; 
  title: string;
  description?: string;
  price: number;
  start_at: string;
  end_at: string;
  
  festival_id: number;
  artist_id: number;
  stage_id: number;

  artist?: Artist; 
  stage?: Stage;
  festival?: Festival;
}
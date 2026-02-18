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

  festival?: {
    id: number;
    name: string;
  };
  artist?: {
    id: number;
    name: string;
  };
  stage?: {
    id: number;
    name: string;
  };
}
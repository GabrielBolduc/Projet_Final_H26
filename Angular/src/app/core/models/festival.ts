export interface Festival {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  status: string;
  
  address?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
  daily_capacity?: number;

  other_expense?: string | number; 
  other_income?: string | number;
  
  satisfaction?: number;
  
  created_at?: string;
  updated_at?: string;
}
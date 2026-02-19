export interface Package {
  id?: number;
  title: string;
  description: string;
  price: number;
  quota: number;
  sold?: number;
  category: 'general' | 'daily' | 'evening';
  valid_at: string | Date;
  expired_at: string | Date;
  festival_id: number;
  image_url?: string;
}
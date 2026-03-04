export interface Artist {
  id: number;
  name: string
  genre: string
  popularity: number;
  bio?: string;
  image_url: string;
  created_at?: string;
  updated_at?: string
}
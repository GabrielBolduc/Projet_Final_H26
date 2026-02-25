import { Package } from './package';

export interface Ticket {
  id: number;
  order_id: number;
  unique_code: string;
  qr_code_url?: string | null;
  refunded: boolean;
  refunded_at: string | null;
  price: number;
  purchased_at?: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  package: Package;
}

export interface UpdateTicketPayload {
  holder_name: string;
  holder_email: string;
  holder_phone: string;
}

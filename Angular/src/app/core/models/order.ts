import { Ticket } from './ticket';

export interface Order {
  id: number;
  user_id: number;
  purchased_at: string;
  tickets: Ticket[];
  discount: number;
  total_price: number;
}

export interface CreateOrderPayload {
  package_id: number;
  quantity: number;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
  tickets?: {
    holder_name: string;
    holder_email: string;
    holder_phone: string;
  }[];
}
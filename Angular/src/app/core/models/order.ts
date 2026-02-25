import { Ticket } from './ticket';

export interface Order {
  id: number;
  user_id: number;
  purchased_at: string;
  tickets: Ticket[];
}

export interface CreateOrderPayload {
  package_id: number;
  quantity: number;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
}

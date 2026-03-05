import { Package } from './package';

export interface Ticket {
  id: number;
  order_id: number;
  unique_code: string;
  refunded_at: string | null;
  price: number;
  purchased_at?: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  package: Package;
}

export function isRefunded(ticket: Ticket | null | undefined): boolean {
  return !!ticket?.refunded_at;
}

export function isExpired(ticket: Ticket | null | undefined): boolean {
  if (!ticket?.package.expired_at) return false;
  return new Date() > new Date(ticket.package.expired_at);
}

export interface UpdateTicketPayload {
  holder_name: string;
  holder_email: string;
  holder_phone: string;
}

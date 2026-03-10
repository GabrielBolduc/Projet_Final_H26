export interface TicketingStats {
  id: number;
  name: string;
  total_tickets_sold: number;
  expenses: number;
  revenues: number;
  profit: number;
  avg_tickets_per_order: number;
  refunds_amount: number;
}

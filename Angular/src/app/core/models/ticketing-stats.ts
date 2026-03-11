export interface TicketingStats {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  year: number;
  total_tickets_sold: number;
  expenses_total: number;
  expenses_performance: number;
  expenses_other: number;
  revenues_total: number;
  revenues_tickets: number;
  revenues_other: number;
  profit: number;
  avg_tickets_per_order: number;
  refunds_count: number;
  refunds_amount: number;
}

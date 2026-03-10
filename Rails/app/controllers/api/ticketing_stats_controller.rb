class Api::TicketingStatsController < ApiController
  before_action :require_admin!

  def index
    @festivals = Festival.all
    stats = @festivals.map do |festival|

      num_orders = Order.for_festival(festival.id).count
      total_tickets_sold = Package.total_tickets_sold_for_festival(festival.id)
      refunds_amount = Package.total_refunds_for_festival(festival.id)
      ticket_revenue = Package.total_revenue_for_festival(festival.id)
      total_discounts = Order.total_discount_for_festival(festival.id)

      # Expenses
      expenses = (festival.other_expense || 0) + festival.performances.sum(:price)

      # Revenues
      revenues = (festival.other_income || 0) + ticket_revenue - total_discounts

      # Profit
      profit = revenues - expenses

      # Avg. tickets per order
      avg_tickets_per_order = num_orders > 0 ? (total_tickets_sold.to_f / num_orders).round(2) : 0

      {
        id: festival.id,
        name: festival.name,
        total_tickets_sold: total_tickets_sold,
        expenses: expenses.to_f.round(2),
        revenues: revenues.to_f.round(2),
        profit: profit.to_f.round(2),
        avg_tickets_per_order: avg_tickets_per_order,
        refunds_amount: refunds_amount.to_f.round(2)
      }
    end

    render json: {
      status: "success",
      data: stats
    }
  end
end
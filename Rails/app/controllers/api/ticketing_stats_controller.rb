class Api::TicketingStatsController < ApiController
  before_action :require_admin!

  def index
    categories = normalize_categories(params[:categories])
    start_date = parse_date(params[:start_date])
    end_date = parse_date(params[:end_date])

    @festivals = Festival.order(start_at: :desc).includes(:performances)

    if start_date
      @festivals = @festivals.where("end_at >= ?", start_date)
    end
    if end_date
      @festivals = @festivals.where("start_at <= ?", end_date)
    end

    stats = @festivals.map do |festival|
      num_orders = Order.count_for_festival(festival.id, categories: categories)
      total_tickets_sold = Package.total_tickets_sold_for_festival(festival.id, categories: categories)
      refunds_amount = Package.total_refunds_for_festival(festival.id, categories: categories)
      refunds_count = Package.total_refund_count_for_festival(festival.id, categories: categories)
      ticket_revenue = Package.total_revenue_for_festival(festival.id, categories: categories)
      total_discounts = Order.total_discount_for_festival(festival.id, categories: categories)
      expenses_performance = festival.performances.sum(&:price)
      expenses_other = festival.other_expense || 0
      expenses_total = expenses_performance + expenses_other
      revenues_other = festival.other_income || 0
      revenues_tickets = ticket_revenue - total_discounts
      revenues_total = revenues_other + revenues_tickets
      profit = revenues_total - expenses_total
      avg_tickets_per_order = num_orders > 0 ? (total_tickets_sold.to_f / num_orders).round(2) : 0
      {
        id: festival.id,
        name: festival.name,
        start_at: festival.start_at,
        end_at: festival.end_at,
        year: festival.start_at.year,
        total_tickets_sold: total_tickets_sold,
        expenses_total: expenses_total.to_f.round(2),
        expenses_performance: expenses_performance.to_f.round(2),
        expenses_other: expenses_other.to_f.round(2),
        revenues_total: revenues_total.to_f.round(2),
        revenues_tickets: revenues_tickets.to_f.round(2),
        revenues_other: revenues_other.to_f.round(2),
        profit: profit.to_f.round(2),
        avg_tickets_per_order: avg_tickets_per_order,
        refunds_count: refunds_count,
        refunds_amount: refunds_amount.to_f.round(2)
      }
    end

    render json: { status: "success", data: stats }
  end

  private

  def normalize_categories(raw_categories)
    values = Array(raw_categories)
      .flat_map { |value| value.to_s.split(",") }
      .map { |value| value.to_s.strip.downcase }
      .reject(&:blank?)
      .uniq

    valid_keys = values.select { |value| Package.categories.key?(value) }
    return nil if valid_keys.empty?
    valid_keys.map { |key| Package.categories[key] }
  end

  def parse_date(value)
    return nil if value.blank?
    Date.parse(value)
  rescue ArgumentError
    nil
  end
end

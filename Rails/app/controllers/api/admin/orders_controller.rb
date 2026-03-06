class Api::Admin::OrdersController < Api::AdminController
  def index
    orders = Order.includes(:user, tickets: [ package: :festival ])
                  .joins(:user)

    if params[:festival_id].present?
      orders = orders.joins(tickets: :package).where(packages: { festival_id: params[:festival_id] }).distinct
    end

    if params[:q].present?
      query = "%#{params[:q].downcase}%"
      orders = orders.where("LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?", query, query)
    end

    sort_direction = params[:sort] == "asc" ? :asc : :desc
    orders = orders.order(purchased_at: sort_direction)

    render json: {
      status: "success",
      data: orders.map { |order| format_order_list(order) }
    }, status: :ok
  end

  def show
    order = Order.includes(:user, tickets: [ package: :festival ]).find(params[:id])
    render json: {
      status: "success",
      data: format_order_detail(order)
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render_error("Order not found")
  end

  private

  def format_order_list(order)
    {
      id:           order.id,
      purchased_at: order.purchased_at,
      client_name:  order.user.name,
      client_email: order.user.email,
      ticket_count: order.tickets.size,
      subtotal:     order.subtotal,
      discount:     order.discount,
      total_price:  order.total_price,
      packages:     order.tickets.map { |t| t.package.title }.uniq
    }
  end

  def format_order_detail(order)
    {
      id:           order.id,
      purchased_at: order.purchased_at,
      client_name:  order.user.name,
      client_email: order.user.email,
      subtotal:     order.subtotal,
      discount:     order.discount,
      total_price:  order.total_price,
      tickets:      order.tickets.map { |ticket| format_ticket(ticket) }
    }
  end

  def format_ticket(ticket)
    package = ticket.package
    {
      id:           ticket.id,
      unique_code:  ticket.unique_code,
      holder_name:  ticket.holder_name,
      holder_email: ticket.holder_email,
      holder_phone: ticket.holder_phone,
      refunded_at:  ticket.refunded_at,
      price:        ticket.price,
      package: {
        id:          package.id,
        title:       package.title,
        category:    package.category,
        valid_at:    package.valid_at,
        expired_at:  package.expired_at
      }
    }
  end
end

class Api::OrdersController < Api::ClientController
  include TicketPayloadFormatting

  before_action :set_order, only: :show

  # GET /api/orders
  def index
    orders = user_orders_scope.order(purchased_at: :desc)

    render json: {
      status: "success",
      data: orders.map { |order| format_order(order) }
    }, status: :ok
  end

  # GET /api/orders/:id
  def show
    render json: {
      status: "success",
      data: format_order(@order)
    }, status: :ok
  end

  # POST /api/orders
  def create
    package = Package.find(order_params[:package_id])
    quantity = order_params[:quantity].to_i

    if package.festival.nil? || package.festival.status != "ongoing"
      return render_error("Package is not available for purchase")
    end

    now = Time.current
    if package.expired_at && package.expired_at < now
      return render_error("Package has expired")
    end

    return render_error("Quantity must be greater than 0") if quantity <= 0

    subtotal = package.price * quantity
    discount = if package.discount_min_quantity && quantity >= package.discount_min_quantity
      (subtotal * package.discount_rate).round(2)
    else
      0
    end

    order = nil
    ActiveRecord::Base.transaction do
      order = current_user.orders.create!(discount: discount)

      if order_params[:tickets].present? && order_params[:tickets].is_a?(Array)
        # Détenteurs multiples fournis depuis le frontend
        order_params[:tickets].take(quantity).each do |t_params|
          order.tickets.create!(
            package:      package,
            holder_name:  sanitized_or_default(t_params[:holder_name],  current_user.name),
            holder_email: sanitized_or_default(t_params[:holder_email], current_user.email),
            holder_phone: sanitized_or_default(t_params[:holder_phone], current_user.phone_number)
          )
        end

        # Si moins de détenteurs fournis que de quantité, remplir le reste avec les infos du user actuel
        (quantity - order_params[:tickets].size).times do
          order.tickets.create!(
            package:      package,
            holder_name:  current_user.name,
            holder_email: current_user.email,
            holder_phone: current_user.phone_number
          )
        end
      else
        # Compatibilité ascendante / repli sur détenteur unique
        holder_name  = sanitized_or_default(order_params[:holder_name],  current_user.name)
        holder_email = sanitized_or_default(order_params[:holder_email], current_user.email)
        holder_phone = sanitized_or_default(order_params[:holder_phone], current_user.phone_number)

        quantity.times do
          order.tickets.create!(
            package:      package,
            holder_name:  holder_name,
            holder_email: holder_email,
            holder_phone: holder_phone
          )
        end
      end
    end


    render json: {
      status: "success",
      data: format_order(order.reload)
    }, status: :ok
  rescue ActiveRecord::RecordNotFound
    render_error("Package not found")
  rescue ActiveRecord::RecordInvalid => e
    render_error("Validation failed", e.record.errors.messages)
  end

  private

  def set_order
    @order = user_orders_scope.find(params[:id])
  end

  def order_params
    params.require(:order).permit(
      :package_id, :quantity,
      :holder_name, :holder_email, :holder_phone,
      tickets: [ :holder_name, :holder_email, :holder_phone ]
    )
  end

  def format_order(order)
    {
      id:           order.id,
      user_id:      order.user_id,
      purchased_at: order.purchased_at,
      subtotal:     order.subtotal,
      discount:     order.discount,
      total_price:  order.total_price,
      tickets:      order.tickets.map { |ticket| format_ticket_payload(ticket) }
    }
  end

  def user_orders_scope
    current_user.orders.includes(tickets: [ package: :festival ])
  end

  def sanitized_or_default(value, default_value)
    cleaned = value.to_s.strip
    return default_value.to_s.strip if cleaned.blank?
    cleaned
  end
end

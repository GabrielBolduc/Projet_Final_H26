class Api::OrdersController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found

  before_action :require_client!
  before_action :set_order, only: [ :show ]

  # GET /api/orders
  def index
    orders = current_user.orders
                        .includes(tickets: [ package: :festival ])
                        .order(purchased_at: :desc)

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

    if quantity <= 0
      return render_error("Quantity must be greater than 0")
    end

    holder_name = sanitized_or_default(order_params[:holder_name], current_user.name)
    holder_email = sanitized_or_default(order_params[:holder_email], current_user.email)
    holder_phone = sanitized_or_default(order_params[:holder_phone], current_user.phone_number)

    if holder_name.blank? || holder_email.blank? || holder_phone.blank?
      return render_error("Holder information is incomplete")
    end

    order = nil

    ActiveRecord::Base.transaction do
      order = current_user.orders.create!

      quantity.times do
        order.tickets.create!(
          package: package,
          holder_name: holder_name,
          holder_email: holder_email,
          holder_phone: holder_phone
        )
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
    @order = current_user.orders
                         .includes(tickets: [ package: :festival ])
                         .find(params[:id])
  end

  def order_params
    params.require(:order).permit(
      :package_id, :quantity,
      :holder_name, :holder_email, :holder_phone
    )
  end

  def require_client!
    return if current_user&.is_a?(Client)

    render_error("Client authentication required")
  end

  def handle_not_found
    render_error("Resource not found")
  end

  def format_order(order)
    {
      id: order.id,
      user_id: order.user_id,
      purchased_at: order.purchased_at,
      tickets: order.tickets.map { |ticket| format_ticket(ticket) }
    }
  end

  def format_ticket(ticket)
    package = ticket.package

    {
      id: ticket.id,
      order_id: ticket.order_id,
      unique_code: ticket.unique_code,
      qr_code_url: ticket.generate_qr_code,
      refunded: ticket.refunded,
      refunded_at: ticket.refunded_at,
      price: ticket.price,
      purchased_at: ticket.purchased_at,
      holder_name: ticket.holder_name,
      holder_email: ticket.holder_email,
      holder_phone: ticket.holder_phone,
      package: {
        id: package.id,
        title: package.title,
        description: package.description,
        category: package.category,
        valid_at: package.valid_at,
        expired_at: package.expired_at,
        festival_id: package.festival_id,
        image_url: package_image_url(package)
      }
    }
  end

  def package_image_url(package)
    return nil unless package.image.attached?

    rails_blob_url(package.image, host: request.base_url)
  end

  def sanitized_or_default(value, default_value)
    cleaned = value.to_s.strip
    return default_value.to_s.strip if cleaned.blank?

    cleaned
  end

  def render_error(message, errors = nil)
    payload = {
      status: "error",
      message: message
    }
    payload[:errors] = errors if errors.present?

    render json: payload, status: :internal_server_error
  end
end

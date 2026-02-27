class Api::TicketsController < Api::ClientController
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found

  before_action :set_ticket, only: [ :show, :update, :destroy ]

  # GET /api/tickets
  def index
    tickets = Ticket.joins(:order)
                    .where(orders: { user_id: current_user.id })
                    .includes(package: :festival, order: :user)
                    .order(created_at: :desc)

    render json: {
      status: "success",
      data: tickets.map { |ticket| format_ticket(ticket) }
    }, status: :ok
  end

  # GET /api/tickets/:id
  def show
    render json: {
      status: "success",
      data: format_ticket(@ticket)
    }, status: :ok
  end

  # PATCH/PUT /api/tickets/:id
  def update
    return render_error("Cannot update a refunded ticket") if @ticket.refunded?

    if @ticket.update(ticket_params)
      render json: {
        status: "success",
        data: format_ticket(@ticket.reload)
      }, status: :ok
    else
      render_error("Validation failed", @ticket.errors)
    end
  end

  # DELETE /api/tickets/:id
  # billet reste dans l'historique mais est marqué comme remboursé
  def destroy
    return render_error("Ticket already refunded") if @ticket.refunded?

    @ticket.update!(refunded: true, refunded_at: Time.current)

    render json: {
      status: "success",
      data: format_ticket(@ticket.reload)
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render_error("Refund failed", e.record.errors)
  end

  private

  def set_ticket
    @ticket = Ticket.joins(:order)
                    .where(orders: { user_id: current_user.id })
                    .includes(package: :festival, order: :user)
                    .find(params[:id])
  end

  def handle_not_found
    render_error("Resource not found")
  end

  def ticket_params
    params.require(:ticket).permit(:holder_name, :holder_email, :holder_phone)
  end

  def format_ticket(ticket)
    package = ticket.package
    {
      id:           ticket.id,
      order_id:     ticket.order_id,
      unique_code:  ticket.unique_code,
      qr_code_url:  ticket.generate_qr_code,
      refunded:     ticket.refunded,
      refunded_at:  ticket.refunded_at,
      price:        ticket.price,
      purchased_at: ticket.purchased_at,
      holder_name:  ticket.holder_name,
      holder_email: ticket.holder_email,
      holder_phone: ticket.holder_phone,
      package: {
        id:          package.id,
        title:       package.title,
        description: package.description,
        category:    package.category,
        valid_at:    package.valid_at,
        expired_at:  package.expired_at,
        festival_id: package.festival_id,
        image_url:   package_image_url(package)
      }
    }
  end

  def package_image_url(package)
    return nil unless package.image.attached?
    rails_blob_url(package.image, host: request.base_url)
  end
end

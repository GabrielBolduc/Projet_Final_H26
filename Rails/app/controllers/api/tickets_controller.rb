class Api::TicketsController < Api::ClientController
  include TicketPayloadFormatting

  before_action :set_ticket, only: [ :show, :update, :destroy ]

  # GET /api/tickets
  def index
    tickets = user_tickets_scope.order(created_at: :desc)

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
  # Le billet reste dans l'historique mais est marqué comme remboursé
  def destroy
    return render_error("Ticket already refunded") if @ticket.refunded?

    if @ticket.package.expired_at < Time.current
      return render_error("Cannot refund an expired ticket")
    end

    @ticket.update!(refunded_at: Time.current)

    render json: {
      status: "success",
      data: format_ticket(@ticket.reload)
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render_error("Refund failed", e.record.errors)
  end

  private

  def set_ticket
    @ticket = user_tickets_scope.find(params[:id])
  end

  def ticket_params
    params.require(:ticket).permit(:holder_name, :holder_email, :holder_phone)
  end

  def user_tickets_scope
    Ticket.joins(:order)
          .where(orders: { user_id: current_user.id })
          .includes(package: :festival, order: :user)
  end

  def format_ticket(ticket)
    format_ticket_payload(ticket)
  end
end

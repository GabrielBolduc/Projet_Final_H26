class Api::ReservationsController < ApiController
  before_action :set_reservation, only: [ :show, :update, :destroy ]
  before_action :require_permission!, only: [ :show, :update, :destroy ]

  def index
    return render_validation_success([]) if current_user.nil?

    query = if admin_user? && params[:admin_view] == "true"
              Reservation.all
    elsif params[:history] == "true"
              current_user.reservations.where(status: [ :completed, :cancelled ])
    else
              current_user.reservations.active.joins(:festival).where(festivals: { status: :ongoing })
    end

    if params[:status_filter].present? && params[:status_filter] != "all"
      case params[:status_filter]
      when "active"    then query = query.active
      when "cancelled" then query = query.cancelled
      when "archived"
        query = query.left_joins(:festival).where("reservations.status = 2")
      end
    end

    if params[:search].present?
      term = "%#{params[:search].downcase}%"
      query = query.joins(unit: :accommodation).where("LOWER(accommodations.name) LIKE ?", term)
    end

    sort_column = params[:sort_by] == "status" ?
      "CASE WHEN reservations.status = 1 THEN 2 WHEN reservations.status = 2 THEN 1 ELSE 0 END" :
      "reservations.#{params[:sort_by] || 'created_at'}"

    total_count = query.count
    @reservations = query.includes(:festival, unit: :accommodation)
                        .order(Arel.sql("#{sort_column} #{params[:order] || 'desc'}"))
                        .limit(params[:per_page] || 10)
                        .offset(((params[:page] || 1).to_i - 1) * (params[:per_page] || 10).to_i)

    render json: { status: "success", data: @reservations.map { |r| r.as_json(base_url: request.base_url) }, total: total_count }
  end

  def show
    render_validation_success(@reservation.as_json(base_url: request.base_url))
  end

  def create
    @reservation = Reservation.new(reservation_params)
    @reservation.festival = Festival.ongoing.first
    @reservation.user = current_user

    if @reservation.save
      render_validation_success(@reservation.as_json(base_url: request.base_url))
    else
      render_validation_error(@reservation)
    end
  end

  def update
    if @reservation.update(reservation_params)
      render_validation_success(@reservation.as_json(base_url: request.base_url))
    else
      render_validation_error(@reservation)
    end
  end

  def destroy
    if @reservation.cancelled!
      render json: { status: "success", message: "Cancelled" }, status: :ok
    else
      render_validation_error(@reservation)
    end
  end

  private

  def set_reservation
    @reservation = Reservation.find(params[:id])
  end

  def require_permission!
    unless admin_user? || @reservation.user_id == current_user&.id
      render_error("Accès refusé.")
    end
  end

  def reservation_params
    params.require(:reservation).permit(:unit_id, :user_id, :arrival_at, :departure_at, :nb_of_people, :reservation_name, :phone_number)
  end
end

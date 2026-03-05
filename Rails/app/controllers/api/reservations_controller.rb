class Api::ReservationsController < ApiController
  before_action :set_reservation, only: [ :show, :update, :destroy ]
  before_action :require_permission!, only: [ :show, :update, :destroy ]

  def index
    return render json: { status: "success", data: [] } if current_user.nil?

    query = if params[:unit_id].present?
              # Allow seeing all busy dates for a specific unit
              Reservation.where(unit_id: params[:unit_id]).active
    elsif admin_user?
              Reservation.all
    elsif params[:history] == "true"
              current_user.reservations.where(status: [ :completed, :cancelled ])
    else
              current_user.reservations.active
    end

    @reservations = query.includes(:festival, unit: :accommodation).order(created_at: :desc)

    data = @reservations.map do |res|
      json = res.as_json(include: :festival)
      if res.unit
        json[:unit] = res.unit.formatted_json(request.base_url).merge({
          accommodation: res.unit.accommodation.as_json
        })
      end
      json
    end

    render json: { status: "success", data: data }
  end


  def show
    render json: { status: "success", data: format_reservation_json(@reservation) }
  end

  def create
    @reservation = Reservation.new(reservation_params)

    @reservation.festival = Festival.ongoing.first

    @reservation.user = current_user

    if @reservation.save
      render_validation_success(@reservation)
    else
      render_validation_error(@reservation)
    end
  end

  def update
    if @reservation.update(reservation_params)
      render_validation_success(@reservation)
    else
      render_validation_error(@reservation)
    end
  end

  def destroy
    if @reservation.cancelled!
      render json: { status: "success", message: "Reservation cancelled" }, status: :ok
    else
      render_validation_error(@reservation)
    end
  end

  private

  def set_reservation
    @reservation = Reservation.find(params[:id])
  end

  def require_permission!
    unless admin_user? || @reservation.user_id == current_user.id
      render_error("Accès refusé : Propriétaire requis.")
    end
  end

  def reservation_params
    params.require(:reservation).permit(
      :unit_id, :user_id,
      :arrival_at, :departure_at, :nb_of_people,
      :reservation_name, :phone_number
    )
  end

  def format_reservation_json(res)
    json = res.as_json(include: :festival)
    if res.unit
      json[:unit] = res.unit.formatted_json(request.base_url).merge({
        accommodation: res.unit.accommodation.as_json
      })
    end
    json
  end
end

class Api::ReservationsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index ], raise: false
  before_action :set_reservation, only: [ :update, :destroy ]

  def index
    if current_user
      @reservations = current_user.reservations.includes(unit: { image_attachment: :blob })
    else
      @reservations = Reservation.none
    end

    render_success(format_reservations(@reservations))
  end

  def create
    @reservation = current_user.reservations.build(reservation_params)

    if @reservation.save
      render_success(@reservation.as_json(include: :unit), :created)
    else
      render_error(@reservation.errors.full_messages, 422)
    end
  end

  def update
    if @reservation.update(reservation_params)
      render_success(@reservation.as_json(include: :unit))
    else
      render_error(@reservation.errors.full_messages, 422)
    end
  end

  def destroy
    if @reservation.destroy
      render json: { status: "success", message: "Reservation cancelled" }, status: :ok
    else
      render_error("Could not cancel reservation", 400)
    end
  end


  private

  def set_reservation
    @reservation = current_user.reservations.find_by(id: params[:id])
    render_error("Reservation not found", 404) unless @reservation
  end

  def reservation_params
    params.require(:reservation).permit(
      :arrival_at, :departure_at, :nb_of_people,
      :reservation_name, :phone_number, :unit_id, :festival_id
    )
  end

  def format_reservations(reservations)
    reservations.map do |res|
      res.as_json(include: { unit: { only: [ :type, :cost_person_per_night ] } }).merge(
        "unit_image_url" => res.unit.image.attached? ? url_for(res.unit.image) : nil
      )
    end
  end

  def render_success(data, status = :ok)
    render json: { status: "success", data: data }, status: status
  end

  def render_error(message, code)
    render json: { status: "error", message: message, code: code }, status: :ok
  end
end

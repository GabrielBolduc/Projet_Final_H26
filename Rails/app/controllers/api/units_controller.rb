class Api::UnitsController < ApiController
    before_action :set_reservation, only: [ :show, :update, :destroy ]
    before_action :require_owner_or_admin!, only: [ :show, :update, :destroy ]

    # List reservations with optional filters
    def index
        @reservations = if current_user.is_a?(Admin)
            Reservation.all
        else
            current_user.reservations
        end

        # Optional filtering by Unit or Festival
        @reservations = @reservations.where(unit_id: params[:unit_id]) if params[:unit_id]
        @reservations = @reservations.where(festival_id: params[:festival_id]) if params[:festival_id]

        render json: {
            status: "success",
            data: @reservations
        }
    end

    def show
        render json: {
            status: "success",
            data: @reservation
        }, status: :ok
    end

    def create
        @reservation = Reservation.new(reservation_params)
        @reservation.user = current_user unless current_user.is_a?(Admin) && params[:reservation][:user_id]

        if @reservation.save
            render json: { status: "success", data: @reservation }, status: :ok
        else
            render_logic_error(@reservation.errors.full_messages)
        end
    end

    def update
        if @reservation.update(reservation_params)
            render json: { status: "success", data: @reservation }, status: :ok
        else
            render_logic_error(@reservation.errors.full_messages)
        end
    end

    def destroy
        if @reservation.destroy
            render json: { status: "success", message: "Reservation cancelled" }, status: :ok
        else
            render_logic_error("Could not cancel reservation")
        end
    end

    private

    def set_reservation
        @reservation = Reservation.find_by(id: params[:id])
        render_logic_error("Reservation not found") unless @reservation
    end

    def reservation_params
        params.require(:reservation).permit(
            :unit_id, :festival_id, :user_id, 
            :arrival_at, :departure_at, :nb_of_people, 
            :reservation_name, :phone_number
        )
    end

    def require_owner_or_admin!
        unless current_user.is_a?(Admin) || @reservation.user_id == current_user.id
            render_logic_error("Access denied: You do not own this reservation.")
        end
    end

    def render_logic_error(message)
        render json: { status: "error", message: message }, status: :ok
    end
end

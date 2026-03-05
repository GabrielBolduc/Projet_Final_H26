class Api::FestivalsController < ApiController
  before_action :authenticate_user!, only: [ :create, :update, :destroy ]
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  before_action :set_festival, only: [ :show, :update, :destroy ]

  def index
    festivals = Festival.recent

    festivals = festivals.filter_by_status(params[:status]) if params[:status].present?

    unless current_user&.is_a?(Admin)
      festivals = festivals.publicly_visible
    end

    render json: {
      status: "success",
      data: festivals.as_json
    }, status: :ok
  end

  def show
    if params[:id] == "current" && @festival.nil?
      return render json: {
        status: "success",
        data: nil,
        message: "Aucun festival en cours"
      }, status: :ok
    end

    unless @festival.ongoing? || current_user&.is_a?(Admin)
      return render json: {
        status: "error",
        message: "Festival non public"
      }, status: :ok
    end

    render json: {
      status: "success",
      data: @festival.as_json
    }, status: :ok
  end

  def create
    festival = Festival.new(festival_params)

    if festival.save
      render json: {
        status: "success",
        data: festival.as_json
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la validation",
        errors: festival.errors.messages
      }, status: :ok
    end
  end

  def update
    if @festival.update(festival_params)
      render json: {
        status: "success",
        data: @festival.as_json
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la mise à jour",
        errors: @festival.errors.messages
      }, status: :ok
    end
  end

  def destroy
    if @festival.destroy
      render json: {
        status: "success",
        message: "Festival supprimé avec succès.",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Impossible de supprimer ce festival.",
        errors: @festival.errors.messages
      }, status: :ok
    end
  end

  private

  def set_festival
    if params[:id] == "current"
      @festival = Festival.ongoing.first
    else
      @festival = Festival.find(params[:id])
    end
  end

  def festival_params
    params.require(:festival).permit(
      :name, :start_at, :end_at, :status, :address,
      :daily_capacity, :satisfaction, :other_income, :other_expense,
      :latitude, :longitude, :comment
    )
  end
end

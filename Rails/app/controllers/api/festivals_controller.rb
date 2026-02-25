class Api::FestivalsController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response

  skip_before_action :authenticate_user!, only: [ :index, :show, :current ], raise: false
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  
  before_action :set_festival, only: [ :show, :update, :destroy ]

  def index
    festivals = Festival.recent

    if params[:status].present?
      festivals = festivals.where(status: params[:status])
    end

    unless current_user&.is_a?(Admin)
      festivals = festivals.where(status: 'ongoing')
    end

    render json: {
      status: "success",
      data: festivals.as_json
    }, status: :ok
  end

  def show
    unless current_user&.is_a?(Admin) || @festival.ongoing?
      return  render json: {
        status: "error",
        message: "festival non public"
      }, status: :ok
    end
    render json: {
      status: "success",
      data: @festival.as_json
    }, status: :ok
  end

  def current
    festival = Festival.ongoing.first

    if festival
      render json: {
        status: "success",
        data: festival.as_json
      }, status: :ok
    else
      render json: {
        status: "success",
        data: nil,
        message: "Aucun festival en cours"
      }, status: :ok
    end
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
    @festival = Festival.find(params[:id])
  end

  def not_found_response
    render json: {
      status: "error",
      message: "Resource not found"
    }, status: :ok
  end

  def festival_params
    params.require(:festival).permit(
      :name, :start_at, :end_at, :status, :address, 
      :daily_capacity, :satisfaction, :other_income, :other_expense,
      :latitude, :longitude, :comment
    )
  end
end
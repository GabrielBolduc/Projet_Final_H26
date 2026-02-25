class Api::PerformancesController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response

  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  before_action :set_performance, only: [ :show, :update, :destroy ]
  

  def index
    performances = Performance.chronological.includes(:artist, :stage, :festival)
    
    if params[:festival_id].present?
      performances = performances.where(festival_id: params[:festival_id])
    end

    unless current_user&.is_a?(Admin)
      performances = performances.joins(:festival).where(festivals: {status: 'ongoing'})
    end
    
    render json: {
      status: "success",
      data: performances.as_json(include: [ :artist, :stage, :festival ])
    }, status: :ok
  end

  def show
    render json: {
      status: "success",
      data: @performance.as_json(include: [ :artist, :stage, :festival ])
    }, status: :ok
  end

  def create
    performance = Performance.new(performance_params)

    if performance.save
      render json: {
        status: "success",
        data: performance.as_json(include: [:artist, :stage, :festival])
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la validation",
        errors: performance.errors.messages
      }, status: :ok
    end
  end

  def update
    if @performance.update(performance_params)
      render json: {
        status: "success",
        data: @performance.as_json(include: [ :artist, :stage, :festival ])
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la mise à jour",
        errors: @performance.errors.messages
      }, status: :ok
    end 
  end

  def destroy
    @performance.destroy
    render json: {
      status: "success",
      message: "Performance supprimée avec succès.",
      data: nil
    }, status: :ok
  end

  private

  def set_performance
    @performance = Performance.includes(:artist, :stage, :festival).find(params[:id])
  end

  def not_found_response
    render json: {
      status: "error",
      message: "Performance introuvable."
    }, status: :ok
  end

  def performance_params
    params.require(:performance).permit(
      :title, :description, :price, :start_at, :end_at,
      :artist_id, :stage_id, :festival_id
    )
  end

  def require_admin!
    unless current_user&.is_a?(Admin)
      render json: {
        status: "error",
        message: "Accès refusé : Privilèges administrateur requis."
      }, status: :ok
    end
  end
end
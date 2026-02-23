class Api::PerformancesController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :set_performance, only: [ :show, :update, :destroy ]
  before_action :require_admin!, only: [ :create, :update, :destroy ]

  def index
    ongoing_festival = Festival.find_by(status: 'ongoing')
    
    if ongoing_festival
      performances = Performance.includes(:artist, :stage, :festival)
                                .where(festival_id: ongoing_festival.id)
                                .order(start_at: :asc)
      
      render json: {
        status: "success",
        code: 200,
        data: performances.as_json(include: [ :artist, :stage, :festival ])
      }, status: :ok
    else
      render json: {
        status: "success", 
        code: 200,
        data: [],
        message: "Aucun festival en cours trouvé."
      }, status: :ok
    end
  end

  def show
    if @performance
      render json: {
        status: "success",
        code: 200,
        data: @performance.as_json(include: [ :artist, :stage, :festival ])
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance introuvable."
      }, status: :ok
    end
  end

  def create
    performance = Performance.new(performance_params)

    if performance.save
      render json: {
        status: "success",
        code: 201,
        data: performance.as_json(include: [:artist, :stage, :festival])
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 422,
        message: "Échec de la validation",
        errors: performance.errors.messages
      }, status: :ok
    end
  end

  def update
    if @performance
      if @performance.update(performance_params)
        render json: {
          status: "success",
          code: 200,
          data: @performance.as_json(include: [ :artist, :stage, :festival ])
        }, status: :ok
      else
        render json: {
          status: "error",
          code: 422,
          message: "Échec de la mise à jour",
          errors: @performance.errors.messages
        }, status: :ok
      end 
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance introuvable."
      }, status: :ok
    end
  end

  def destroy
    if @performance
      @performance.destroy
      render json: {
        status: "success",
        code: 200,
        message: "Performance supprimée avec succès.",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 404,
        message: "Performance introuvable."
      }, status: :ok
    end
  end

  private

  def set_performance
    @performance = Performance.includes(:artist, :stage, :festival).find_by(id: params[:id])
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
        code: 403,
        message: "Accès refusé : Privilèges administrateur requis."
      }, status: :ok
    end
  end
end
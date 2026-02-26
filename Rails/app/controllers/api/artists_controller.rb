class Api::ArtistsController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response

  def index
    @artists = Artist.alphabetical

    if params[:genre].present?
      @artists = @artists.by_genre(params[:genre])
    end
    
    render json: {
      status: 'success',
      data: @artists
    }, status: :ok
  end

  private 
  
  def not_found_response
    render json: {
      status: "error",
      message: "Artiste introuvable."
    }, status: :ok
  end
end
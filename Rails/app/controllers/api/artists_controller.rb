class Api::ArtistsController < ApiController
  def index
    @artists = Artist.all

    render json: {
      status: 'success',
      data: @artists
    }, status: :ok
  end
end
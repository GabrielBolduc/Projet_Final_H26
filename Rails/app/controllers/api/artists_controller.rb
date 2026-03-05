class Api::ArtistsController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  before_action :set_artist, only: [ :show, :update, :destroy ]

  def genres
    render json: {
      status: "success",
      data: Artist.used_genres
    }, status: :ok
  end

  def index
    artists = Artist.default_order
    artists = artists.search(params[:search]) if params[:search].present?
    artists = artists.by_genre(params[:genre]) if params[:genre].present?

    render json: {
      status: "success",
      data: artists.as_json(methods: [ :image_url ])
    }, status: :ok
  end

  def show
    render json: {
      status: "success",
      data: @artist.as_json(methods: [ :image_url ])
    }, status: :ok
  end

  def create
    artist = Artist.new(artist_params)

    if artist.save
      render json: {
        status: "success",
        data: artist.as_json(methods: [ :image_url ])
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la validation",
        errors: artist.errors.messages
      }, status: :ok
    end
  end

  def update
    if @artist.update(artist_params)
      render json: {
        status: "success",
        data: @artist.as_json(methods: [ :image_url ])
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Échec de la mise à jour",
        errors: @artist.errors.messages
      }, status: :ok
    end
  end

  def destroy
    if @artist.destroy
      render json: {
        status: "success",
        message: "Artiste supprimé avec succès.",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Impossible de supprimer cet artiste car il est lié à des performances.",
        errors: @artist.errors.messages
      }, status: :ok
    end
  end

  private

  def set_artist
    @artist = Artist.find(params[:id])
  end

  def artist_params
    params.require(:artist).permit(:name, :genre, :bio, :popularity, :image)
  end
end

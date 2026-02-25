class Api::PackagesController < ApiController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response

  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :set_package, only: [:show, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  # GET /api/packages
  def index
    packages = Package.admin_scope(
      festival_id: params[:festival_id],
      status: params[:status],
      query: params[:q],
      sort: params[:sort],
      categories: params[:categories]
    )
    
    render json: {
      status: "success",
      data: packages.map { |pkg| format_package(pkg) }
    }, status: :ok
  end

  # GET /api/packages/:id
  def show
    render json: {
      status: "success",
      data: format_package(@package)
    }, status: :ok
  end

  # POST /api/packages (Admin Only)
  def create
    package = Package.new(package_params)

    if package.save
      render json: {
        status: "success",
        data: format_package(package)
      }, status: :ok
    else
      render_validation_error(package)
    end
  end

  # PATCH/PUT /api/packages/:id
  def update
    if @package.update(package_params)
      render json: {
        status: "success",
        data: format_package(@package)
      }, status: :ok
    else
      render_validation_error(@package)
    end
  end

  # DELETE /api/packages/:id
  def destroy
    deleted_package_data = {
      id: @package.id,
      title: @package.title,
      festival_id: @package.festival_id
    }

    if @package.destroy
      render json: {
        status: "success",
        message: "Package deleted successfully",
        data: deleted_package_data
      }, status: :ok
    else
      render json: {
        status: "error",
        message: "Cannot delete package",
        errors: @package.errors.full_messages
      }, status: :ok
    end
  end

  private

  def set_package
    @package = Package.includes(:festival, :tickets).find(params[:id])
  end

  def package_params
    params.require(:package).permit(
      :title, :description, :price, :quota, 
      :category, :valid_at, :expired_at, 
      :festival_id, :image
    )
  end

  # Vérification stricte Admin (STI)
  def require_admin!
    unless current_user&.is_a?(Admin)
      render json: {
        status: "error",
        message: "Access denied: Admin privileges required."
      }, status: :ok
    end
  end

  def not_found_response
    render_error("Package not found")
  end

  def format_package(package)
    sold_count = if package.association(:tickets).loaded?
      package.tickets.count { |ticket| !ticket.refunded }
    else
      package.tickets.where(refunded: false).count
    end

    json = package.as_json(include: :festival)
    if package.image.attached?
      json.merge(
        image_url: rails_blob_url(package.image, host: request.base_url),
        sold: sold_count
      )
    else
      json.merge(image_url: nil, sold: sold_count)
    end
  end

  def render_error(message)
    render json: {
      status: "error",
      message: message
    }, status: :ok
  end

  def render_validation_error(record)
    render json: {
      status: "error",
      message: "Validation failed",
      errors: record.errors
    }, status: :ok
  end
end

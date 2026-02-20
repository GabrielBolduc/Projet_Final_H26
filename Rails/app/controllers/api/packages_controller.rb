class Api::PackagesController < ApiController
  skip_before_action :authenticate_user!, only: [ :index, :show ], raise: false
  before_action :set_package, only: [:show, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  # GET /api/packages
  def index
    packages = Package.includes(:festival).order(price: :asc)
    
    render json: {
      status: "success",
      data: packages.map { |pkg| format_package(pkg) }
    }, status: :ok
  end

  # GET /api/packages/:id
  def show
    if @package
      render json: {
        status: "success",
        data: format_package(@package)
      }, status: :ok
    else
      render_error(404, "Package not found")
    end
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
    if @package.destroy
      render json: {
        status: "success",
        message: "Package deleted successfully",
        data: nil
      }, status: :ok
    else
      render json: {
        status: "error",
        code: 422,
        message: "Cannot delete package",
        errors: @package.errors.full_messages
      }, status: :ok
    end
  end

  private

  def set_package
    @package = Package.find_by(id: params[:id])
    render_error(404, "Package not found") unless @package
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
    unless current_user.is_a?(Admin)
      render json: {
        status: "error",
        code: 403,
        message: "Access denied: Admin privileges required."
      }, status: :ok
    end
  end

  def format_package(package)
    json = package.as_json(include: :festival)
    if package.image.attached?
      json.merge(image_url: url_for(package.image))
    else
      json.merge(image_url: nil)
    end
  end

  def render_error(code, message)
    render json: {
      status: "error",
      code: code,
      message: message
    }, status: :ok
  end

  def render_validation_error(record)
    render json: {
      status: "error",
      code: 422,
      message: "Validation failed",
      errors: record.errors
    }, status: :ok
  end
end
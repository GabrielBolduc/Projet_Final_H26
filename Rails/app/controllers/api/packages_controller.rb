class Api::PackagesController < Api::AdminController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found_response
  skip_before_action :require_admin!, only: [ :index, :show ]
  before_action :require_admin!, only: [ :create, :update, :destroy ]
  before_action :set_package, only: [ :show, :update, :destroy ]

  # GET /api/packages
  def index
    packages = Package.admin_scope(**index_scope_options)
    packages = Package.filter_by_weekdays(packages, params[:dow]) if params[:dow].present?

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
    scope = Package.includes(:festival)
    scope = scope.joins(:festival).where(festivals: { status: Festival.statuses[:ongoing] }) unless admin_user?
    @package = scope.find(params[:id])
  end

  def index_scope_options
    options = {
      query:      params[:q],
      sort:       params[:sort],
      categories: params[:categories]
    }

    if admin_user?
      options.merge(
        festival_id: params[:festival_id],
        status:      params[:status],
        sold_out:    params[:sold_out]
      )
    else
      options.merge(status: Festival.statuses[:ongoing])
    end
  end

  def package_params
    params.require(:package).permit(
      :title, :description, :price, :quota,
      :category, :valid_at, :expired_at,
      :festival_id, :image, :discount_min_quantity, :discount_rate
    )
  end

  def not_found_response
    render_error("Package not found")
  end

  def format_package(package)
    sold_count = package.sold_count

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
end

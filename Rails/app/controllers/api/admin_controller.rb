class Api::AdminController < ApiController
  before_action :require_admin!

  private

  def require_admin!
    unless admin_user?
      render json: {
        status: "error",
        message: "Access denied: Admin privileges required."
      }, status: :ok
    end
  end

  def admin_user?
    current_user&.is_a?(Admin)
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
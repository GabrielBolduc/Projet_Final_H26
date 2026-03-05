class ApiController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  respond_to :json
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  def admin_user?
    current_user&.is_a?(Admin)
  end

  def require_admin!
    unless admin_user?
      render json: {
        status: "error",
        message: "Accès refusé : Privilèges administrateur requis."
      }, status: :ok
    end
  end

  def render_validation_error(record)
    render json: {
      status: "error",
      message: "Validation failed",
      errors: record.errors.messages
    }, status: :ok
  end

  def render_validation_success(record)
    render json: {
      status: "success",
      data: record
    }, status: :ok
  end

  def render_error(message)
    render json: {
      status: "error",
      message: message
    }, status: :ok
  end

  private

  def not_found
    render json: {
      status: "error",
      message: "Resource not found"
    }, status: :ok
  end
end

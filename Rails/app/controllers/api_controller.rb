class ApiController < ApplicationController
  respond_to :json
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  def not_found
    render json: '{"error": "not_found"}', status: :not_found
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

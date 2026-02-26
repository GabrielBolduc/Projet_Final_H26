class Api::ClientController < ApiController
  before_action :require_client!

  private

  def require_client!
    unless current_user.is_a?(Client)
      render json: {
        status: "error",
        message: "Client authentication required."
      }, status: :ok
    end
  end

  def render_error(message, errors = nil)
    payload = { status: "error", message: message }
    payload[:errors] = errors if errors.present?
    render json: payload, status: :ok
  end
end
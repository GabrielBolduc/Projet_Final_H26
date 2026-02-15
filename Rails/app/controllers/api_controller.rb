class ApiController < ApplicationController
  respond_to :json
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  def not_found
    render json: '{"error": "not_found"}', status: :not_found
  end
end

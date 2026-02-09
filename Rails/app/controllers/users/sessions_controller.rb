# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    render json: {
      status: 'success',
      data: {
        user: {
          email: resource.email,
          role: resource.role
        }
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    render json: {
      status: 'success'
    }, status: :ok
  end
end
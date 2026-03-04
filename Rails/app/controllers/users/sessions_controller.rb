# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    render json: {
      status: "success",
      data: {
        user: {
          id: resource.id,
          email: resource.email,
          type: resource.type,
          name: resource.name,
          phone_number: resource.phone_number,
          ability: resource.ability
        }
      }
    }, status: :ok
  end

  # * pour accept arguments envoyer par devise 5
  def respond_to_on_destroy(*)
    render json: {
      status: "success"
    }, status: :ok
  end
end

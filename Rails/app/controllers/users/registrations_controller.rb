# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)
    resource.save
    yield resource if block_given?
    
    if resource.persisted?
      if resource.active_for_authentication?
        sign_up(resource_name, resource)
        render json: {
          status: 'success',
          data: {
            id: resource.id,
            email: resource.email,
            name: resource.name,
            role: resource.role
          }
        }, status: :ok
      else
        expire_data_after_sign_in!
        render json: {
          status: 'success',
          data: {
            email: resource.email
          }
        }, status: :ok
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      # si erreur de validation (ex: mot de passe trop court, email utilise)
      render json: {
        status: 'error',
        message: 'validation failed',
        errors: resource.errors.full_messages,
        code: 422 # Unprocessable entity
      }, status: :ok
    end
  end
end
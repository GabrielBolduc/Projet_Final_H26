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
        render json: { success: true, email: resource.email }
      else
        expire_data_after_sign_in!
        render json: { success: false, email: resource.email }
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      # En cas d'erreur de validation (ex: mot de passe trop court, email déjà pris)
      render json: { success: false, email: resource.email, errors: resource.errors.full_messages }
    end
  end
end
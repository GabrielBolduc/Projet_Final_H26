# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  # POST /resource/sign_in
  # Connecte l'utilisateur et renvoie son email en JSON
  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    render json: { success: true, email: resource.email }
  end

  # DELETE /resource/sign_out
  # Appelé par Devise lors de la déconnexion
  # L'énoncé demande explicitement de renvoyer { success: false }
  def respond_to_on_destroy
    render json: { success: false }
  end
end
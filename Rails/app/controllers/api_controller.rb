class ApiController < ApplicationController
  # Désactive la sécurité CSRF pour les API
  skip_before_action :verify_authenticity_token, raise: false
  
  # Pour répondre en JSON proprement
  respond_to :json
  
  # INTERCEPTION DES ERREURS 404
  # C'est cette ligne qui capture l'erreur "ActiveRecord::RecordNotFound"
  # et l'envoie vers la méthode "not_found"
  rescue_from ActiveRecord::RecordNotFound, with: :success

  # --- Helpers ---

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
      data: record.as_json
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
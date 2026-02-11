class CustomFailure < Devise::FailureApp
  def respond
    # On vérifie si c'est une requête JSON
    if request.format == :json || request.content_type == 'application/json'
      self.status = 200 # <--- CONFORME À VOTRE PROJET (Toujours 200)
      self.content_type = 'application/json'
      self.response_body = {
        status: 'error',
        message: "Invalid Credentials", # ex: "Email ou mot de passe invalide"
        code: 401            # Le vrai code d'erreur est ICI, dans le JSON
      }.to_json
    else
      super
    end
  end
end

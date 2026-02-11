class CustomFailure < Devise::FailureApp
  def respond
    if request.format == :json || request.content_type == 'application/json'
      self.status = 200 # Standard imposé par le projet
      self.content_type = 'application/json'
      self.response_body = {
        status: 'error',
        message: i18n_message,
        code: 401
      }.to_json
    else
      super
    end
  end
end

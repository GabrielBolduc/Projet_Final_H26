class CustomFailure < Devise::FailureApp
  def respond
    self.status = 200
    self.content_type = "application/json"
    self.response_body = {
      status: "error",
      message: "Invalid login credentials",
      code: 401
    }.to_json
  end
end

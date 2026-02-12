class AngularController < ActionController::Base
  def index
    render file: 'public/browser/index.html'
  end
end

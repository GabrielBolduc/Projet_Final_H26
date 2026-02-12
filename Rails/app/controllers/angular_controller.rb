class AngularController < ActionController::Base
  def index
    render file: Rails.root.join('public', 'browser', 'index.html')
  end
end

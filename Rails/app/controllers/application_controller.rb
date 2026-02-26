class ApplicationController < ActionController::Base
    before_action :configure_permitted_parameters, if: :devise_controller?

    protect_from_forgery with: :null_session, if: -> { request.format.json? }
    protected

    def configure_permitted_parameters
        keys = [ :name, :phone_number, :type, :ability ]
        devise_parameter_sanitizer.permit(:sign_up, keys: keys)
        devise_parameter_sanitizer.permit(:account_update, keys: keys)
    end
end

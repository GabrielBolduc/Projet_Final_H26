Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, constraints: { format: "json" } do
  end

  match "*url", to: "angular#index", via: :get

  root to: "angular#index"
end

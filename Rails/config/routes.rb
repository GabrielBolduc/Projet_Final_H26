Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    resources :festivals, only: [:index, :show]
    resources :tasks do
      collection do
        get 'get_reusable', to: 'tasks#get_reusable'
      end
    end
    resources :festivals do
      collection do
        get 'current'
      end
    end
     
    resources :artists, only: [:index]
    resources :stages, only: [:index]
    resources :performances
    resources :reservations
    resources :accommodations
    resources :packages
  end

  root to: "angular#index"

  get "*path", to: "angular#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end

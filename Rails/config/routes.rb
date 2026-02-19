Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    resources :festivals, only: [:index, :show]
    resources :tasks, only: [:index, :show,:create,:update, :destroy]
    resources :artists, only: [:index]
    resources :stages, only: [:index]
    resources :performances
  end

  root to: "angular#index"
  
  get '*path', to: 'angular#index', constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end
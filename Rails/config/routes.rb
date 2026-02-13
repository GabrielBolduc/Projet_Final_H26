Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, constraints: { format: 'json' } do
  end

  root to: "angular#index"
  get '*path', to: 'angular#index', constraints: ->(req) do

    !req.xhr? && 
    req.format.html? && 
    !req.path.include?('.')
  end
end
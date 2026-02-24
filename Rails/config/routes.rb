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
     
    resources :artists, only: [:index]
    resources :stages, only: [:index]
    resources :performances
    resources :reservations
    resources :accommodations
    resources :packages
     resources :affectations do
      collection do
        get 'get_by_user/:user_id',
            to: 'affectations#get_by_user',
            as: :get_by_user

        get 'get_by_task/:task_id',
            to: 'affectations#get_by_task',
            as: :get_by_task
      end
    end
  end

  root to: "angular#index"

  get "*path", to: "angular#index", constraints: ->(req) do
    !req.xhr? && req.format.html?
  end
end

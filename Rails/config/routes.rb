Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    resources :festivals, only: [ :index, :show, :create, :update, :destroy ]

    resources :tasks do
      collection do
        get "get_reusable", to: "tasks#get_reusable"
        get "raport", to: "tasks#raport"
      end
    end

    get 'stats/festivals', to: 'festivals_stats#index'

    resources :stages, only: [ :index ]
    resources :performances
    resources :reservations
    resources :orders, only: [ :index, :show, :create ]
    resources :tickets, only: [ :index, :show, :update, :destroy ]

    resources :accommodations do
      resources :units, shallow: true
    end

    resources :artists do
      collection do
        get :genres
      end
    end

    resources :packages

    get "ticketing_stats", to: "ticketing_stats#index"
    get "stats/accommodations", to: "accommodations_stats#index"

    namespace :admin do
      resources :orders, only: [ :index, :show ]
    end

    resources :affectations do
      collection do
        get "get_by_user/:user_id", to: "affectations#get_by_user", as: :get_by_user
        get "get_by_task/:task_id", to: "affectations#get_by_task", as: :get_by_task
        get "get_staff_list", to: "affectations#get_staff_list", as: :get_staff_list
      end
    end
  end

  root to: "angular#index"

  get "*path", to: "angular#index", constraints: ->(req) do
    !req.xhr? && req.format.html? && !req.path.include?(".")
  end
end

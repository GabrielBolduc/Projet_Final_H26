Rails.application.routes.draw do
  # 1. Configuration Devise (Authentification)
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  # 2. Vérification de santé (Health Check)
  get "up" => "rails/health#show", as: :rails_health_check

  # 3. API (Placez vos futures routes d'API ici)
  namespace :api, constraints: { format: 'json' } do
    # Ex: resources :events
  end

  # =========================================================
  # IMPORTANT : Ces routes doivent rester À LA FIN du fichier
  # =========================================================

  # Route racine : Charge l'app Angular
  root to: "angular#index"

  # Route "Catch-all" : Redirige toutes les URL inconnues vers Angular
  # (Sauf si c'est une requête API ou un fichier statique manquant)
  get '*path', to: 'angular#index', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
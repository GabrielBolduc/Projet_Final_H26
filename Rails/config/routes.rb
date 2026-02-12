Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, constraints: { format: 'json' } do
  end

  root to: "angular#index"

  # --- LA CORRECTION EST ICI ---
  get '*path', to: 'angular#index', constraints: ->(request) do
    !request.xhr? && request.format.html? && !request.path.include?('.')
  end
  # L'ajout de "!request.path.include?('.')" est indispensable.
  # Il garantit que si le navigateur cherche un fichier (image.png, script.js),
  # Rails ne renverra JAMAIS l'application Angular par erreur, mais une vraie erreur 404.
end
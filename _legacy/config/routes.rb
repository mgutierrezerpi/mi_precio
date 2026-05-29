Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Routes for tenants with subdomains
  constraints subdomain: /^(?!www\z)\w+/ do
    # Devise routes for tenant users
    devise_for :users, path: "admin"

    # Public pages
    root "pages#index", as: :tenant_root
    get "pages/index"

    # Admin panel
    namespace :admin do
      root "dashboard#index"
      resources :lists do
        member do
          patch :toggle_publish
          patch :toggle_index
        end
        resources :versions, controller: "list_versions" do
          member do
            post :publish
            post :duplicate
          end
          resources :items
        end
      end
    end
  end

  # Routes for main domain (no subdomain or www)
  constraints subdomain: /^(www)?$/ do
    root "landing#index"
    get "landing/index"
  end
end

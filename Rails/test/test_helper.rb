ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    # Ajout des test Devise
    include Devise::Test::IntegrationHelpers
    Rails.application.routes.default_url_options[:host] = "localhost:3000"


    def attach_images_to_units
      Unit.all.each do |unit|
        next if unit.image.attached?
        
        unit.image.attach(
          io: File.open(Rails.root.join('test/fixtures/files/placeholder-image.jpg')),
          filename: 'test_image.png',
          content_type: 'image/png'
        )
      end
    end
  end
end

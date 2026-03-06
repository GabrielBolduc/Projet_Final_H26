# test/integration/Alexandre/Units/units_invalid_create.rb
require "test_helper"

class Api::UnitsControllerInvalidCreateTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
        @accommodation = accommodations(:one) # Grand Hotel (Category 1)
        @camping = accommodations(:two)       # Forest Camping (Category 0)
        @user = users(:one)  # Client role
        @staff = users(:two) # Staff role

        @admin = users(:three)
        sign_in @admin
        @image = fixture_file_upload("placeholder-image.jpg", "image/jpeg")
    end

  def test_create_unit_denied_for_client
    sign_in @user

    # Validation de la cohérence de la base de données
    assert_no_difference "Unit.count" do
      # Code http
      post api_accommodation_units_url(@accommodation), params: {
        unit: { type: "Units::SimpleRoom", quantity: 5, cost_person_per_night: 50.0 }
      }, as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    # Updated to match the French string in your ApiController
    assert_equal "Accès refusé : Privilèges administrateur requis.", json_response["message"]
  end


  def test_create_unit_denied_for_staff
    sign_in @staff

    # Code http
    post api_accommodation_units_url(@accommodation), params: {
      unit: { type: "Units::SimpleRoom", quantity: 1 }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    # Updated to match the French string in your ApiController
    assert_equal "Accès refusé : Privilèges administrateur requis.", json_response["message"]
  end


    def test_create_unit_fails_without_image
        sign_in @admin

        # Code http
        post api_accommodation_units_url(@accommodation), params: {
            unit: {
                type: "Units::SimpleRoom",
                cost_person_per_night: 99.00,
                quantity: 10,
                wifi: true,
                parking_cost: 0
            }
        }, as: :json

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Validation failed", json_response["message"]

        # Access the specific error nested in the 'errors' key
        assert_includes json_response["errors"]["image"], "must be uploaded"

        # Validation de la cohérence de la base de données
        assert_not Unit.exists?(cost_person_per_night: 99.00)
    end


  def test_create_fails_with_invalid_quantity
    sign_in @admin
    @accommodation.update!(category: :hotel)

    # Removing 'as: :json' to allow multipart/form-data for the mandatory image upload
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 0, # Invalid: must be > 0
        cost_person_per_night: 50,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the specific attribute error in the 'errors' hash
    # Note: Rails default message is "must be greater than 0"
    assert_includes json_response["errors"]["quantity"], "must be greater than 0"

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(quantity: 0)
  end


  def test_create_fails_with_negative_costs
    sign_in @admin
    @accommodation.update!(category: :hotel)

    # Use multipart (no as: :json) for the image attachment
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 1,
        cost_person_per_night: -10.0,
        parking_cost: -5.0,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the specific numericality errors in the errors hash
    assert_includes json_response["errors"]["cost_person_per_night"], "must be greater than or equal to 0"
    assert_includes json_response["errors"]["parking_cost"], "must be greater than or equal to 0"
  end

  def test_create_fails_room_type_for_camping
    sign_in @admin
    # Ensure the target is a camping site (cat 0)
    @accommodation.update!(category: :camping)

    # Use multipart (no as: :json) for the image attachment
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 1,
        cost_person_per_night: 20,
        parking_cost: 0,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the specific STI validation error in the errors hash
    assert_includes json_response["errors"]["type"], "cannot be a room for a camping site"
  end


  def test_create_fails_terrain_type_for_hotel
    sign_in @admin
    # Ensure the target is a hotel
    @accommodation.update!(category: :hotel)

    # Use multipart (no as: :json) for the image attachment
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::StandardTerrain",
        quantity: 1,
        cost_person_per_night: 100,
        parking_cost: 0,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the specific STI validation error in the errors hash
    assert_includes json_response["errors"]["type"], "cannot be a terrain for a hotel"
  end


    def test_create_fails_with_invalid_water_enum
        # Enum Validation: Rails raises ArgumentError if value isn't in hash
        assert_raises(ArgumentError) do
        post api_accommodation_units_url(@accommodation), params: {
            unit: { type: "Units::SimpleRoom", water: "sparkling_water", image: @image }
        }, as: :json
        end
    end

  def test_create_fails_with_missing_accommodation
    sign_in @admin

    # Code http
    # Using a direct path to bypass URL helper validation for non-existent IDs
    post "/api/accommodations/999999/units", params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 1,
        cost_person_per_night: 50,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    # Updated to match the "Resource not found" string in your ApiController
    assert_equal "Resource not found", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(quantity: 1, cost_person_per_night: 50)
  end


  def test_create_with_invalid_food_option
    sign_in @admin
    @accommodation.update!(category: :hotel)

    # Use multipart for the image attachment
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 1,
        cost_person_per_night: 99.99,
        parking_cost: 0,
        # Required by your 'must_have_image' validation
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg"),
        food_options: [ "Caviar Bar" ] # Invalid: not in ALLOWED_FOOD
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the custom validation error in the errors hash
    assert_includes json_response["errors"]["food_options"].join, "contains invalid values: Caviar Bar"

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(cost_person_per_night: 99.99)
  end


    def test_create_ignores_forbidden_params
        # Code http
        post api_accommodation_units_url(@accommodation), params: {
            unit: {
                type: "Units::SimpleRoom",
                quantity: 1,
                cost_person_per_night: 50,
                image: @image,
                id: 12345,
                created_at: 10.years.ago
            }
        }

        # Validation de la cohérence de la base de données
        new_unit = Unit.find_by(cost_person_per_night: 50)
        assert_not_equal 12345, new_unit.id
        assert_in_delta Time.current, new_unit.created_at, 5.seconds
    end

  def test_create_fails_with_excessive_quantity
    sign_in @admin
    @accommodation.update!(category: :hotel)

    # Multipart post to allow the image attachment
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        quantity: 150, # Invalid: must be <= 100
        cost_person_per_night: 50,
        parking_cost: 0,
        image: fixture_file_upload("placeholder-image.jpg", "image/jpeg")
      }
    }

    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Validation failed", json_response["message"]

    # Check the specific attribute error in the 'errors' hash
    assert_includes json_response["errors"]["quantity"], "must be less than or equal to 100"

    # Validation de la cohérence de la base de données
    assert_nil Unit.find_by(quantity: 150)
  end
end

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
        @image = fixture_file_upload('placeholder-image.jpg', 'image/jpeg')
    end

    def test_create_unit_denied_for_client
        sign_in @user

        # Code http
        post api_accommodation_units_url(@accommodation), params: {
        unit: { type: "Units::SimpleRoom", quantity: 5, cost_person_per_night: 50.0 }
        }, as: :json

        # Format json valide
        assert_response :ok 
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Access denied: Admin privileges required.", json_response["message"]

        # Validation de la cohérence de la base de données
        assert_no_difference 'Unit.count' do
        end
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
        assert_match /Access denied/, json_response["message"]
    end

    def test_create_unit_fails_without_image
        @admin = users(:three)
        sign_in @admin

        # Code http
        post api_accommodation_units_url(@accommodation), params: {
        unit: {
            type: "Units::SimpleRoom",
            cost_person_per_night: 99.00,
            quantity: 10,
            wifi: true
        }
        }, as: :json

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_includes json_response["message"].join(", "), "Image must be uploaded"

        # Validation de la cohérence de la base de données
        assert_equal 0, Unit.where(cost_person_per_night: 99.00).count
    end

    def test_create_fails_with_invalid_quantity
        # Validation: numericality: { only_integer: true, greater_than: 0 }
        post api_accommodation_units_url(@accommodation), params: {
        unit: { type: "Units::SimpleRoom", quantity: 0, cost_person_per_night: 50, image: @image }
        }, as: :json

        assert_response :ok
        json_response = JSON.parse(response.body)
        assert_includes json_response["message"].join, "Quantity must be greater than 0"
    end

    def test_create_fails_with_negative_costs
        # Validation: numericality: { greater_than_or_equal_to: 0 }
        post api_accommodation_units_url(@accommodation), params: {
        unit: { 
            type: "Units::SimpleRoom", 
            quantity: 1, 
            cost_person_per_night: -10.0, 
            parking_cost: -5.0,
            image: @image 
        }
        }, as: :json

        assert_response :ok
        messages = JSON.parse(response.body)["message"].join
        assert_includes messages, "Cost person per night must be greater than or equal to 0"
        assert_includes messages, "Parking cost must be greater than or equal to 0"
    end

    def test_create_fails_room_type_for_camping
        # Custom Validation: type_matches_accommodation_category
        # Camping (cat 0) cannot have SimpleRoom
        post api_accommodation_units_url(@camping), params: {
        unit: { type: "Units::SimpleRoom", quantity: 1, cost_person_per_night: 20, image: @image }
        }, as: :json

        assert_response :ok
        json_response = JSON.parse(response.body)
        assert_includes json_response["message"].join, "cannot be a room for a camping site"
    end

    def test_create_fails_terrain_type_for_hotel
        # Custom Validation: type_matches_accommodation_category
        # Hotel (cat 1) cannot have StandardTerrain
        post api_accommodation_units_url(@accommodation), params: {
        unit: { type: "Units::StandardTerrain", quantity: 1, cost_person_per_night: 100, image: @image }
        }, as: :json

        assert_response :ok
        json_response = JSON.parse(response.body)
        assert_includes json_response["message"].join, "cannot be a terrain for a hotel"
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
        # Controller check: Accommodation.find_by
        post "/api/accommodations/9999/units", params: {
        unit: { type: "Units::SimpleRoom", quantity: 1, cost_person_per_night: 50, image: @image }
        }, as: :json

        assert_response :ok
        assert_equal "Accommodation not found", JSON.parse(response.body)["message"]
    end

    def test_create_with_invalid_food_option
        sign_in @admin

        post api_accommodation_units_url(@accommodation), params: {
            unit: { 
            type: "Units::SimpleRoom", 
            quantity: 1, 
            cost_person_per_night: 99.99, 
            image: @image,
            food_options: ["Caviar Bar"] 
            }
        }

        assert_response :ok
        json_response = JSON.parse(response.body)
        
        # Contenu du format json
        assert_equal "error", json_response["status"]
        
        all_errors = Array(json_response["message"]).join(" ")
        assert_includes all_errors, "contains invalid values"

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
        post api_accommodation_units_url(@accommodation), params: {
            unit: { 
            type: "Units::SimpleRoom", 
            quantity: 150, 
            cost_person_per_night: 50, 
            image: @image 
            }
        }

        assert_response :ok
        json_response = JSON.parse(response.body)
        all_errors = json_response["message"].join(", ")
        
        assert_equal "error", json_response["status"]
        assert_includes all_errors, "must be less than or equal to 100"
    end
end

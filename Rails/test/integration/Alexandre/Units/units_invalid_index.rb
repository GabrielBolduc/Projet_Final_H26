# test/integration/Alexandre/Units/units_invalid_index.rb
require "test_helper"

class Api::UnitsControllerInvalidIndexTest < ActionDispatch::IntegrationTest

    setup do
        @accommodation = accommodations(:one) 
        @other_accommodation = accommodations(:two) 
    end


    def test_index_accommodation_not_found
        # Code http
        invalid_id = 999999
        get api_accommodation_units_url(accommodation_id: invalid_id), as: :json

        # Format json valide
        assert_response :ok 
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Accommodation not found", json_response["message"]

        # Validation de la cohérence de la base de données
        assert_nil Accommodation.find_by(id: invalid_id)
    end

    def test_index_missing_accommodation_id
        # Code http
        get "/api/accommodations//units", as: :json

        # Format json valide
        assert_response :ok 
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Accommodation not found", json_response["message"]

        # Validation de la cohérence de la base de données
        assert_nil Accommodation.find_by(id: nil)
    end

    def test_index_does_not_leak_other_accommodation_units
        @other_accommodation = accommodations(:two) # Forest Camping
        
        # Code http
        get api_accommodation_units_url(@accommodation), as: :json

        # Format json valide
        assert_response :success
        json_response = JSON.parse(response.body)

        # Contenu du format json
        returned_ids = json_response["data"].map { |u| u["id"] }
        forbidden_ids = @other_accommodation.units.pluck(:id)
        
        assert (returned_ids & forbidden_ids).empty?, "Index leaked units from another accommodation"

        # Validation de la cohérence de la base de données
        assert_not_equal @accommodation.id, @other_accommodation.id
    end

    def test_index_returns_empty_array_when_no_units
        # Code http (Preparation)
        @empty_hotel = Accommodation.create!(
            name: "Empty Inn", 
            festival: festivals(:one), 
            category: 1, 
            address: "456 Empty St",
            latitude: 45.0000,
            longitude: -73.0000,
            shuttle: false,     
            time_car: "00:10:00",   
            time_walk: "00:30:00",  
            commission: 10.0
        )

        get api_accommodation_units_url(@empty_hotel), as: :json

        # Format json valide
        assert_response :success
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "success", json_response["status"]
        assert_equal [], json_response["data"], "Should return an empty list for a new hotel"

        # Validation de la cohérence de la base de données
        assert_equal 0, @empty_hotel.units.count
    end
end

# test/integration/Alexandre/Accommodations/accommodations_invalid_destroy.rb
require "test_helper"

class Api::AccommodationsControllerInvalidDestroyTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
        @admin = users(:three) 
        @user = users(:one) # Client
        @staff = users(:two) # Staff
        @accommodation = accommodations(:one) # Grand Hotel
    end

    def test_destroy_accommodation_denied_for_client
        sign_in @user

        # Code http
        delete api_accommodation_url(@accommodation), as: :json

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Access denied: Admin privileges required.", json_response["message"]

        # Validation de la cohérence de la base de données
        assert Accommodation.exists?(@accommodation.id)
    end

    def test_destroy_accommodation_denied_for_staff
        sign_in @staff

        # Code http
        delete api_accommodation_url(@accommodation), as: :json

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_match /Access denied/, json_response["message"]

        # Validation de la cohérence de la base de données
        assert Accommodation.exists?(@accommodation.id)
    end

    def test_destroy_accommodation_not_found
        sign_in @admin

        # Code http
        invalid_id = 999999
        delete "/api/accommodations/#{invalid_id}", as: :json

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)

        # Contenu du format json
        assert_equal "error", json_response["status"]
        assert_equal "Accommodation not found", json_response["message"]

        # Validation de la cohérence de la base de données
        assert_nil Accommodation.find_by(id: invalid_id)
    end



    def test_destroy_accommodation_cascades_to_reservations
        sign_in @admin
        target_unit = units(:one)
        target_reservation = reservations(:one)
        
        unit_id = target_unit.id
        res_id = target_reservation.id

        # Code http
        assert_difference(["Accommodation.count", "Reservation.count"], -1) do
            assert_difference("Unit.count", -2) do
            delete api_accommodation_url(@accommodation), as: :json
            end
        end

        # Format json valide
        assert_response :ok
        json_response = JSON.parse(response.body)
        assert_equal "success", json_response["status"]

        # Validation de la cohérence de la base de données
        assert_not Accommodation.exists?(@accommodation.id), "Accommodation should be gone"
        assert_not Unit.exists?(unit_id), "Unit should be gone via cascade"
        assert_not Reservation.exists?(res_id), "Reservation should be gone via deep cascade"
    end

    def test_destroy_accommodation_purges_unit_images
        sign_in @admin
        target_unit = units(:one)
        target_unit.image.attach(fixture_file_upload('placeholder-image.jpg', 'image/jpeg'))
        target_unit.save!
        blob_id = target_unit.image.blob_id

        # Code http
        perform_enqueued_jobs do
            delete api_accommodation_url(@accommodation), as: :json
        end

        # Validation de la cohérence de la base de données
        assert_nil ActiveStorage::Blob.find_by(id: blob_id), "Image blob leaked in database"
    end
end

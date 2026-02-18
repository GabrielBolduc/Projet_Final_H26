require "test_helper"

class ReservationValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = users(:one)
    @unit = units(:three) 
    @festival = festivals(:one)
    
    # Authenticate the user
    sign_in @user
  end

  test "should create reservation with valid data" do
    # Validation de la cohérence de la base de données
    assert_difference("Reservation.count", 1) do
      post api_reservations_url, params: {
        reservation: {
          arrival_at: @festival.start_at,
          departure_at: @festival.end_at,
          nb_of_people: 1,
          reservation_name: "John Doe",
          phone_number: "1234567890",
          unit_id: @unit.id,
          festival_id: @festival.id
        }
      }, as: :json
    end

    # Code http
    assert_response :created

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    assert_equal "John Doe", json["data"]["reservation_name"]
  end

  test "should delete reservation successfully" do
    @reservation = reservations(:one)

    # Validation de la cohérence de la base de données
    assert_difference("Reservation.count", -1) do
      delete api_reservation_url(@reservation), as: :json
    end

    # Code http
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    assert_equal "Reservation cancelled", json["message"]
  end
end

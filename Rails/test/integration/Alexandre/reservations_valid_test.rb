require "test_helper"

class ReservationValidTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @unit = units(:one)
    @festival = festivals(:one)
  end

  test "should create reservation with valid data" do
    # Validation de la cohérence de la base de données
    assert_difference("Reservation.count", 1) do
      post api_reservations_url, params: {
        reservation: {
          arrival_at: @festival.start_date,
          departure_at: @festival.end_date,
          nb_of_people: 2,
          reservation_name: "John Doe",
          phone_number: "1234567890",
          unit_id: @unit.id,
          festival_id: @festival.id
        }
      }, as: :json
    end

    # Code http
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    assert_equal "John Doe", json["data"]["reservation_name"]
    assert_not_nil json["data"]["unit"]
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

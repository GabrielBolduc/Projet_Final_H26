require "test_helper"

class ReservationInvalidTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    setup do
        @user = users(:one)
        @unit = units(:one)
        @festival = festivals(:one)
        sign_in @user
    end

    test "should not create reservation exceeding unit capacity" do
        # Validation de la cohérence de la base de données
        assert_no_difference("Reservation.count") do
        post api_reservations_url, params: {
            reservation: {
            arrival_at: @festival.start_at,
            departure_at: @festival.end_at,
            nb_of_people: 10,
            reservation_name: "Too Many People",
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
        assert_equal "error", json["status"]

        # Contenu du format json
        assert_includes json["message"].join, "exceeds maximum capacity"
    end

    test "should not create overlapping reservation on same unit" do
        existing = reservations(:one)
    
        existing.update_columns(unit_id: @unit.id, festival_id: @festival.id)

        # Validation de la cohérence de la base de données
        assert_no_difference("Reservation.count") do
            post api_reservations_url, params: {
            reservation: {
                arrival_at: existing.arrival_at,
                departure_at: existing.departure_at,
                nb_of_people: 1,
                reservation_name: "Overlapping",
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
        assert_equal "error", json["status"]

        # Contenu du format json
        error_message = json["message"].join(" ")
        assert_includes error_message, "already booked"
    end


    test "should not create reservation outside festival window" do
        # Validation de la cohérence de la base de données
        assert_no_difference("Reservation.count") do
        post api_reservations_url, params: {
            reservation: {
            arrival_at: @festival.start_at - 10.days,
            departure_at: @festival.start_at - 5.days,
            nb_of_people: 1,
            reservation_name: "Too Early",
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
        assert_equal "error", json["status"]

        # Contenu du format json
        assert_includes json["message"].join, "cannot be more than 3 days before"
    end

    test "should not create reservation with invalid phone number" do
        sign_in @user

        # Validation de la cohérence de la base de données
        assert_no_difference("Reservation.count") do
            post api_reservations_url, params: {
            reservation: {
                arrival_at: @festival.start_at,
                departure_at: @festival.end_at,
                nb_of_people: 1,
                reservation_name: "John Doe",
                phone_number: "123",
                unit_id: @unit.id,
                festival_id: @festival.id
            }
            }, as: :json
        end

        # Code http
        assert_response :success

        # Format json valide
        json = JSON.parse(response.body)
        assert_equal "error", json["status"]

        # Contenu du format json
        error_message = json["message"].join(" ")
        assert_includes error_message, "must be between 8 and 15 digits"
    end

  test "should not create reservation with negative number of people" do
    # Validation de la cohérence de la base de données
    assert_no_difference("Reservation.count") do
      post api_reservations_url, params: {
        reservation: {
          arrival_at: @festival.start_at,
          departure_at: @festival.end_at,
          nb_of_people: -1,
          reservation_name: "Negative Ghost Rider",
          phone_number: "1234567890",
          unit_id: @unit.id,
          festival_id: @festival.id
        }
      }, as: :json
    end

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    assert_includes json["message"].join, "must be greater than 0"
  end

  test "should not create reservation with missing required fields" do
    # Validation de la cohérence de la base de données
    assert_no_difference("Reservation.count") do
      post api_reservations_url, params: {
        reservation: {
          arrival_at: nil, 
          departure_at: nil,
          reservation_name: "",
          unit_id: @unit.id,
          festival_id: @festival.id
        }
      }, as: :json
    end

    # Contenu du format json
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]
    errors = json["message"].join(" ")
    assert_includes errors, "Arrival at can't be blank"
    assert_includes errors, "Reservation name can't be blank"
  end

  test "should not create reservation with departure before arrival" do
    # Validation de la cohérence de la base de données
    assert_no_difference("Reservation.count") do
      post api_reservations_url, params: {
        reservation: {
          arrival_at: @festival.end_at,
          departure_at: @festival.start_at,
          nb_of_people: 1,
          reservation_name: "Time Traveler",
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
    assert_equal "error", json["status"]

    # Contenu du format json
    assert_includes json["message"].join, "must be after the arrival date"
  end
end

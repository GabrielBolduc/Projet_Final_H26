require "test_helper"

class Api::AccommodationsStatsControllerSecurityTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @client = users(:one)
    @admin = users(:three)
    attach_images_to_units if respond_to?(:attach_images_to_units)
  end

  test "client is denied access to stats" do
    sign_in @client

    # Code http
    get "/api/stats/accommodations", as: :json
    assert_response :success 

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]

    # Contenu du format json
    assert_match /Privilèges administrateur requis/, json["message"]

    # Validation de la cohérence de la base de données
    assert_nil json["data"]
  end

  test "unauthenticated visitor is denied access" do
    sign_out :user

    # Code http
    get "/api/stats/accommodations", as: :json
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "error", json["status"]

    # Contenu du format json
    assert_match /Privilèges administrateur requis/, json["message"]

    # Validation de la cohérence de la base de données
    assert_nil json["data"]
  end

  test "revenue and profit calculations are accurate for admin" do
    sign_in @admin

    # Code http
    get "/api/stats/accommodations", 
        params: { name: "Grand Hotel" }, 
        as: :json,
        headers: { "REQUEST_METHOD" => "GET" }
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    fest_name = festivals(:one).name
    hotel_stats = json["data"][fest_name]["items"].find { |i| i["name"] == "Grand Hotel" }
    assert_not_nil hotel_stats
    finance = hotel_stats["finance"]

    # Validation de la cohérence de la base de données
    # (1 pers * 55 * 3) + (2 pers * 85 * 2) = 505.00
    expected_revenue = 505.00 
    expected_profit = 429.25 # 505 * 0.85
    assert_in_delta expected_revenue, finance["total_revenue"].to_f, 0.001
    assert_in_delta expected_profit, finance["actual_profit"].to_f, 0.001
  end

  test "all data blocks returned by stats_data are accurate" do
    sign_in @admin

    # Code http
    get "/api/stats/accommodations", 
        params: { name: "Grand Hotel" }, 
        as: :json,
        headers: { "REQUEST_METHOD" => "GET" }
    assert_response :success

    # Format json valide
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]

    # Contenu du format json
    fest_name = festivals(:one).name
    hotel_stats = json["data"][fest_name]["items"].find { |i| i["name"] == "Grand Hotel" }
    
    pricing   = hotel_stats["pricing"]
    services  = hotel_stats["services"]
    inventory = hotel_stats["inventory"]
    res_stats = hotel_stats["reservation_stats"]
    finance   = hotel_stats["finance"]

    # Validation de la cohérence de la base de données

    assert_in_delta 505.00, finance["total_revenue"].to_f, 0.001
    assert_in_delta 429.25, finance["actual_profit"].to_f, 0.001
    assert_equal 60.0, pricing["avg_nightly_rate"].to_f
    assert_equal "full access", services["wifi"]
    assert_equal "partial access", services["water"]
    assert_equal "available", services["parking"]
    assert_equal 25, inventory["total_units"]
    assert_equal 23, inventory["available_now"]
    assert_equal 3, res_stats["total_people"]
    assert_equal 2, res_stats["total_count"]
  end
end

require "test_helper"

class TicketingStatsValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @festival_one = festivals(:one)
    @festival_two = festivals(:two)
    @festival_three = festivals(:three)
  end

  test "admin should fetch ticketing stats successfully without params" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
    assert_not_empty json["data"]

    ids = json["data"].map { |row| row["id"] }
    assert_includes ids, @festival_one.id
    assert_includes ids, @festival_two.id
    assert_includes ids, @festival_three.id

    sample = json["data"].find { |row| row["id"] == @festival_one.id }
    %w[
      id name start_at end_at year total_tickets_sold expenses_total expenses_performance expenses_other
      revenues_total revenues_tickets revenues_other profit avg_tickets_per_order refunds_count refunds_amount
    ].each do |key|
      assert sample.key?(key)
    end
  end

  test "admin should filter stats with only start_date" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?start_date=2026-09-01", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }.sort
    assert_equal [ @festival_three.id ], ids
  end

  test "admin should filter stats with only end_date" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?end_date=2025-07-10", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }.sort
    assert_equal [ @festival_two.id ], ids
  end

  test "admin should filter stats by date range" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?start_date=2026-08-01&end_date=2026-08-03", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    ids = json["data"].map { |row| row["id"] }.sort
    assert_equal [ @festival_one.id ], ids
  end

  test "admin should apply single category filter to ticket counts" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?categories=general", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }

    category_value = Package.categories["general"]
    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id, category: category_value })
    expected_total_tickets_sold = ticket_scope.where(refunded_at: nil).count
    expected_refunds_count = ticket_scope.where.not(refunded_at: nil).count
    expected_refunds_amount = ticket_scope.where.not(refunded_at: nil).sum(:price).to_f.round(2)

    assert_equal expected_total_tickets_sold, festival_row["total_tickets_sold"]
    assert_equal expected_refunds_count, festival_row["refunds_count"]
    assert_in_delta expected_refunds_amount, festival_row["refunds_amount"].to_f, 0.01
  end

  test "admin should apply multiple categories when provided" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing?categories[]=general&categories[]=daily", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }

    category_values = [ Package.categories["general"], Package.categories["daily"] ]
    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id, category: category_values })
    expected_total_tickets_sold = ticket_scope.where(refunded_at: nil).count
    expected_refunds_count = ticket_scope.where.not(refunded_at: nil).count

    assert_equal expected_total_tickets_sold, festival_row["total_tickets_sold"]
    assert_equal expected_refunds_count, festival_row["refunds_count"]
  end

  test "festival with only refunded tickets reports zero sales" do
    sign_in @admin

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_two.id }
    assert_equal 0, festival_row["total_tickets_sold"]
    assert_equal 1, festival_row["refunds_count"]
    assert_in_delta 55.0, festival_row["refunds_amount"].to_f, 0.01
  end

  test "discounts reduce ticket revenues when present" do
    sign_in @admin

    order = Order.create!(user: @client, discount: 10.00)
    package = packages(:two)
    2.times do |i|
      Ticket.create!(
        order: order,
        package: package,
        holder_name: "Discount Holder #{i}",
        holder_email: "discount#{i}@example.com",
        holder_phone: "555-000#{i}"
      )
    end

    # modif ou non
    assert_no_difference("Festival.count") do
      get "/api/stats/ticketing", as: :json
    end

    # code http
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    festival_row = json["data"].find { |row| row["id"] == @festival_one.id }

    ticket_scope = Ticket.joins(:package).where(packages: { festival_id: @festival_one.id })
    expected_ticket_revenue = ticket_scope.where(refunded_at: nil).sum(:price).to_f.round(2)
    expected_total_discounts = Order.total_discount_for_festival(@festival_one.id).to_f.round(2)
    expected_revenues_tickets = (expected_ticket_revenue - expected_total_discounts).round(2)

    assert_operator expected_total_discounts, :>, 0
    assert_in_delta expected_revenues_tickets, festival_row["revenues_tickets"].to_f, 0.01
  end
end

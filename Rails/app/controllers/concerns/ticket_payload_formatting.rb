module TicketPayloadFormatting
  private

  def format_ticket_payload(ticket)
    package = ticket.package

    {
      id:           ticket.id,
      order_id:     ticket.order_id,
      unique_code:  ticket.unique_code,
      refunded_at:  ticket.refunded_at,
      price:        ticket.price,
      purchased_at: ticket.purchased_at,
      holder_name:  ticket.holder_name,
      holder_email: ticket.holder_email,
      holder_phone: ticket.holder_phone,
      package:      format_ticket_package_payload(package)
    }
  end

  def format_ticket_package_payload(package)
    {
      id:          package.id,
      title:       package.title,
      description: package.description,
      category:    package.category,
      valid_at:    package.valid_at,
      expired_at:  package.expired_at,
      festival_id: package.festival_id,
      image_url:   package_image_url(package)
    }
  end

  def package_image_url(package)
    return nil unless package.image.attached?

    rails_blob_url(package.image, host: request.base_url)
  end
end

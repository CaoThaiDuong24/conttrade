
-- Check RFQ data
\c icontexchange


      SELECT 
        r.id,
        r.status,
        r.purpose,
        r.quantity,
        r.buyer_id,
        r.listing_id,
        r.submitted_at,
        u_buyer.email as buyer_email,
        u_buyer.display_name as buyer_name,
        l.title as listing_title,
        l.seller_user_id,
        u_seller.email as seller_email,
        u_seller.display_name as seller_name
      FROM rfqs r
      LEFT JOIN users u_buyer ON r.buyer_id = u_buyer.id
      LEFT JOIN listings l ON r.listing_id = l.id
      LEFT JOIN users u_seller ON l.seller_user_id = u_seller.id
      ORDER BY r.submitted_at DESC
      LIMIT 10;
    
    
-- Migration: Add delivery_reviews table for batch delivery reviews
-- Created: 2025-11-18
-- Purpose: Allow buyers to review each delivery batch after receipt confirmation

-- Create delivery_reviews table
CREATE TABLE IF NOT EXISTS delivery_reviews (
  id VARCHAR(255) PRIMARY KEY,
  delivery_id VARCHAR(255) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewee_id VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  delivery_quality_rating INT CHECK (delivery_quality_rating >= 1 AND delivery_quality_rating <= 5),
  packaging_rating INT CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
  timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  photos_json JSONB,
  response TEXT,
  response_by VARCHAR(255),
  response_at TIMESTAMP,
  moderated BOOLEAN DEFAULT FALSE,
  moderated_by VARCHAR(255),
  moderated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(delivery_id, reviewer_id),
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (response_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_delivery_reviews_delivery_id ON delivery_reviews(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_reviews_order_id ON delivery_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_reviews_reviewer_id ON delivery_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_reviews_reviewee_id ON delivery_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_delivery_reviews_created_at ON delivery_reviews(created_at DESC);

-- Add review_requested flag to deliveries table
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMP;

-- Add comment explaining the new columns
COMMENT ON COLUMN deliveries.review_requested IS 'Flag indicating if review has been requested after receipt confirmation';
COMMENT ON COLUMN deliveries.review_requested_at IS 'Timestamp when review was requested';

COMMENT ON TABLE delivery_reviews IS 'Reviews for individual delivery batches, allowing buyers to rate each batch delivery separately';
COMMENT ON COLUMN delivery_reviews.delivery_quality_rating IS 'Rating for delivery service quality (1-5)';
COMMENT ON COLUMN delivery_reviews.packaging_rating IS 'Rating for packaging quality (1-5)';
COMMENT ON COLUMN delivery_reviews.timeliness_rating IS 'Rating for delivery timeliness (1-5)';

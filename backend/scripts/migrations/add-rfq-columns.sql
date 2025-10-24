-- Add missing columns to RFQ table to match API requirements
ALTER TABLE rfqs 
ADD COLUMN title VARCHAR(255),
ADD COLUMN description TEXT,
ADD COLUMN delivery_location VARCHAR(255),
ADD COLUMN budget DECIMAL(15,2),
ADD COLUMN currency VARCHAR(10) DEFAULT 'VND';
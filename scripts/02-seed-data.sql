-- Seed data for Store Rating Platform
-- Insert initial users, stores, and ratings

-- Insert admin user
INSERT INTO users (name, email, password, address, role) VALUES
('System Administrator User', 'admin@storerating.com', '$2b$10$hashedpassword', '123 Admin Street, Admin City, AC 12345', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert normal users
INSERT INTO users (name, email, password, address, role) VALUES
('Regular User Account Name', 'user@example.com', '$2b$10$hashedpassword', '456 User Avenue, User Town, UT 67890', 'user'),
('Another Normal User Name', 'john.doe@email.com', '$2b$10$hashedpassword', '789 Customer Lane, Customer City, CC 11111', 'user'),
('Third Regular User Name', 'jane.smith@email.com', '$2b$10$hashedpassword', '321 Shopper Street, Shopper Town, ST 22222', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert store owners
INSERT INTO users (name, email, password, address, role) VALUES
('Coffee Corner Store Owner', 'owner@coffeecorner.com', '$2b$10$hashedpassword', '300 Bean Avenue, Midtown, MT 33333', 'store_owner'),
('Fashion Boutique Store Owner', 'owner@fashionboutique.com', '$2b$10$hashedpassword', '200 Style Street, Uptown, UP 44444', 'store_owner'),
('Tech Electronics Store Owner', 'owner@techstore.com', '$2b$10$hashedpassword', '100 Tech Plaza, Downtown, DT 55555', 'store_owner')
ON CONFLICT (email) DO NOTHING;

-- Insert stores
INSERT INTO stores (name, email, address, owner_id) VALUES
('Coffee Corner Store Location', 'hello@coffeecorner.com', '300 Bean Avenue, Midtown', 
 (SELECT id FROM users WHERE email = 'owner@coffeecorner.com')),
('Fashion Boutique Store Location', 'info@fashionboutique.com', '200 Style Street, Uptown',
 (SELECT id FROM users WHERE email = 'owner@fashionboutique.com')),
('Tech Electronics Store Location', 'contact@techstore.com', '100 Tech Plaza, Downtown',
 (SELECT id FROM users WHERE email = 'owner@techstore.com'))
ON CONFLICT (email) DO NOTHING;

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating, comment) VALUES
((SELECT id FROM users WHERE email = 'user@example.com'), 
 (SELECT id FROM stores WHERE email = 'hello@coffeecorner.com'), 
 5, 'Excellent coffee and great service!'),
((SELECT id FROM users WHERE email = 'john.doe@email.com'), 
 (SELECT id FROM stores WHERE email = 'hello@coffeecorner.com'), 
 5, 'Best coffee in town, highly recommended!'),
((SELECT id FROM users WHERE email = 'user@example.com'), 
 (SELECT id FROM stores WHERE email = 'info@fashionboutique.com'), 
 4, 'Great fashion selection, good quality clothes.'),
((SELECT id FROM users WHERE email = 'jane.smith@email.com'), 
 (SELECT id FROM stores WHERE email = 'info@fashionboutique.com'), 
 3, 'Decent store but prices are a bit high.'),
((SELECT id FROM users WHERE email = 'john.doe@email.com'), 
 (SELECT id FROM stores WHERE email = 'contact@techstore.com'), 
 4, 'Good electronics store with helpful staff.')
ON CONFLICT (user_id, store_id) DO NOTHING;

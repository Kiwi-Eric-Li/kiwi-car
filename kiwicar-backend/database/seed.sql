-- KiwiCar Seed Data
-- Run this in the Supabase SQL Editor AFTER running 001_initial_schema.sql
-- https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- 1. Create test users in auth.users
-- ============================================================
-- Password for all test users: Test1234!
-- bcrypt hash of 'Test1234!'
-- Using fixed UUIDs for referential integrity

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'sarah@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), '{"nickname": "Sarah", "phone": "+64211111111"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'mike@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), '{"nickname": "Mike", "phone": "+64212222222"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'emma@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), '{"nickname": "Emma", "phone": "+64213333333"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'david@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), '{"nickname": "David", "phone": "+64214444444"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'john@test.com',
    crypt('Test1234!', gen_salt('bf')),
    now(), '{"nickname": "John", "phone": "+64215555555"}'::jsonb,
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required by Supabase Auth for email login)
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'email',
   '{"sub": "a1111111-1111-1111-1111-111111111111", "email": "sarah@test.com"}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'email',
   '{"sub": "a2222222-2222-2222-2222-222222222222", "email": "mike@test.com"}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'email',
   '{"sub": "a3333333-3333-3333-3333-333333333333", "email": "emma@test.com"}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'email',
   '{"sub": "a4444444-4444-4444-4444-444444444444", "email": "david@test.com"}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), 'a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'email',
   '{"sub": "a5555555-5555-5555-5555-555555555555", "email": "john@test.com"}'::jsonb, now(), now(), now())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Update profiles (created by trigger, update with extra fields)
-- ============================================================
UPDATE profiles SET nickname = 'Sarah',   region = 'Auckland',      avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',   show_phone = true  WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE profiles SET nickname = 'Mike',    region = 'Wellington',    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',    show_phone = false WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE profiles SET nickname = 'Emma',    region = 'Canterbury',    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',    show_phone = true  WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE profiles SET nickname = 'David',   region = 'Waikato',       avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',   show_phone = false WHERE id = 'a4444444-4444-4444-4444-444444444444';
UPDATE profiles SET nickname = 'John',    region = 'Auckland',      avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',    show_phone = true  WHERE id = 'a5555555-5555-5555-5555-555555555555';

-- ============================================================
-- 3. Listings (8 cars, realistic NZ data)
-- ============================================================
-- Using fixed UUIDs for listing_images / favorites / messages FK references

INSERT INTO listings (id, user_id, plate_number, make, model, year, mileage, price, description, ai_description, status, region, fuel_type, transmission, body_type, color, views, created_at, updated_at)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'ABC123', 'Toyota', 'Corolla', 2019, 45000, 24990.00,
    'Well-maintained Toyota Corolla with full service history. One owner from new, always garaged. Features include reversing camera, Bluetooth connectivity, and cruise control. Recent WOF and registration. Perfect reliable daily driver.',
    'This 2019 Toyota Corolla represents excellent value with its low mileage and comprehensive service history. The automatic transmission and fuel-efficient petrol engine make it ideal for city commuting, while the hatchback body style offers practical cargo space.',
    'ACTIVE', 'Auckland', 'PETROL', 'AUTOMATIC', 'Hatchback', 'Silver',
    236, now() - interval '20 days', now() - interval '20 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'a2222222-2222-2222-2222-222222222222',
    'XYZ789', 'Mazda', 'CX-5', 2020, 38000, 38500.00,
    'Stunning Mazda CX-5 in Soul Red Crystal. Top of the line Limited model with all the extras including leather seats, sunroof, heads-up display, and 360-degree camera. Diesel engine provides excellent fuel economy for long trips.',
    'The 2020 Mazda CX-5 Limited in Soul Red is a premium SUV offering. Its diesel powertrain delivers strong torque and impressive fuel efficiency, while the comprehensive safety and luxury features make it a standout choice in the NZ market.',
    'ACTIVE', 'Wellington', 'DIESEL', 'AUTOMATIC', 'SUV', 'Soul Red',
    184, now() - interval '21 days', now() - interval '21 days'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'a3333333-3333-3333-3333-333333333333',
    'DEF456', 'Nissan', 'Leaf', 2021, 25000, 32000.00,
    'Go green with this excellent Nissan Leaf! 40kWh battery with great range for daily driving. Includes home charging cable. Battery health at 94%. Perfect for commuting with virtually no running costs.',
    'This 2021 Nissan Leaf with 40kWh battery offers around 270km range, perfect for NZ city commuting. With 94% battery health and low running costs, it represents the smart choice for eco-conscious Kiwi drivers.',
    'ACTIVE', 'Canterbury', 'ELECTRIC', 'AUTOMATIC', 'Hatchback', 'White',
    312, now() - interval '22 days', now() - interval '22 days'
  ),
  (
    'b4444444-4444-4444-4444-444444444444',
    'a4444444-4444-4444-4444-444444444444',
    'GHI101', 'Ford', 'Ranger', 2022, 55000, 52000.00,
    'Ford Ranger Wildtrak with all the bells and whistles. Tow bar fitted, sports bar, tub liner, and premium sound system. Used for light towing only. Excellent condition inside and out.',
    'The 2022 Ford Ranger Wildtrak is NZ''s favourite ute, and for good reason. This example comes well-equipped for both work and play, with the bi-turbo diesel engine providing strong towing capability while maintaining reasonable fuel economy.',
    'ACTIVE', 'Waikato', 'DIESEL', 'AUTOMATIC', 'Ute', 'Blue',
    428, now() - interval '23 days', now() - interval '23 days'
  ),
  (
    'b5555555-5555-5555-5555-555555555555',
    'a1111111-1111-1111-1111-111111111111',
    'JKL202', 'Honda', 'CR-V', 2018, 72000, 28500.00,
    'Reliable Honda CR-V with plenty of life left. 1.5L turbo engine with impressive fuel economy. Family-sized with flexible rear seating. Apple CarPlay and Android Auto. All services done at Honda dealer.',
    'The Honda CR-V has long been a favourite family SUV in New Zealand. This 2018 model with the 1.5L turbo offers a great balance of performance and efficiency, backed by Honda''s legendary reliability.',
    'ACTIVE', 'Bay of Plenty', 'PETROL', 'MANUAL', 'SUV', 'Black',
    155, now() - interval '24 days', now() - interval '24 days'
  ),
  (
    'b6666666-6666-6666-6666-666666666666',
    'a2222222-2222-2222-2222-222222222222',
    'MNO303', 'Subaru', 'Outback', 2021, 42000, 42990.00,
    'Subaru Outback Premium with EyeSight driver assist technology. Symmetrical all-wheel drive perfect for NZ conditions. X-Mode for off-road capability. Roof rails and tow bar included.',
    'The Subaru Outback is tailor-made for New Zealand''s diverse terrain. With symmetrical AWD and X-Mode, it handles everything from Auckland motorways to Central Otago gravel roads with confidence.',
    'ACTIVE', 'Otago', 'PETROL', 'AUTOMATIC', 'Wagon', 'Green',
    198, now() - interval '25 days', now() - interval '25 days'
  ),
  (
    'b7777777-7777-7777-7777-777777777777',
    'a3333333-3333-3333-3333-333333333333',
    'PQR404', 'Hyundai', 'Kona', 2023, 15000, 39900.00,
    'Nearly new Hyundai Kona Hybrid with remaining factory warranty. Outstanding fuel economy - averaging 4.5L/100km. Bold Ignite Flame color turns heads. Loaded with safety features and tech.',
    'The 2023 Hyundai Kona Hybrid is one of the most efficient SUVs available in New Zealand. With Hyundai''s 5-year warranty still active and just 15,000km on the clock, this is practically a new car at a used car price.',
    'ACTIVE', 'Auckland', 'HYBRID', 'AUTOMATIC', 'SUV', 'Orange',
    87, now() - interval '26 days', now() - interval '26 days'
  ),
  (
    'b8888888-8888-8888-8888-888888888888',
    'a4444444-4444-4444-4444-444444444444',
    'STU505', 'Volkswagen', 'Golf', 2020, 48000, 29990.00,
    'Volkswagen Golf TSI with turbocharged engine. German engineering at its finest. Premium interior quality with digital cockpit display. Adaptive cruise control and lane keep assist. Drives like new.',
    'The Volkswagen Golf remains the benchmark hot hatch. This 2020 TSI model offers the perfect blend of performance, refinement, and practicality that Kiwi drivers love.',
    'ACTIVE', 'Wellington', 'PETROL', 'AUTOMATIC', 'Hatchback', 'Grey',
    263, now() - interval '27 days', now() - interval '27 days'
  ),
  -- Extra listings: SOLD and DRAFT status for variety
  (
    'b9999999-9999-9999-9999-999999999999',
    'a5555555-5555-5555-5555-555555555555',
    'WXY666', 'Mitsubishi', 'Outlander', 2019, 68000, 26500.00,
    'Mitsubishi Outlander LS in excellent condition. 7 seats for the whole family. Bluetooth, reversing camera, and roof rails. Regular servicing at Mitsubishi dealer. Selling as upgrading to PHEV model.',
    NULL,
    'SOLD', 'Auckland', 'PETROL', 'AUTOMATIC', 'SUV', 'White',
    512, now() - interval '45 days', now() - interval '10 days'
  ),
  (
    'ba000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'DFT001', 'Suzuki', 'Swift', 2022, 18000, 21000.00,
    'Draft listing - still adding photos',
    NULL,
    'DRAFT', 'Auckland', 'PETROL', 'AUTOMATIC', 'Hatchback', 'Red',
    0, now() - interval '2 days', now() - interval '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Listing images
-- ============================================================
INSERT INTO listing_images (listing_id, image_url, "order") VALUES
  -- Toyota Corolla (3 images)
  ('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 0),
  ('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', 1),
  ('b1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 2),
  -- Mazda CX-5 (2 images)
  ('b2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 0),
  ('b2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 1),
  -- Nissan Leaf (2 images)
  ('b3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', 0),
  ('b3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 1),
  -- Ford Ranger (2 images)
  ('b4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 0),
  ('b4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 1),
  -- Honda CR-V (2 images)
  ('b5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1568844293986-8c2a5c9b9d64?w=800', 0),
  ('b5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800', 1),
  -- Subaru Outback (2 images)
  ('b6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800', 0),
  ('b6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 1),
  -- Hyundai Kona (2 images)
  ('b7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800', 0),
  ('b7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800', 1),
  -- Volkswagen Golf (2 images)
  ('b8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800', 0),
  ('b8888888-8888-8888-8888-888888888888', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800', 1),
  -- Mitsubishi Outlander (SOLD, 1 image)
  ('b9999999-9999-9999-9999-999999999999', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Vehicle info cache (NZTA mock data)
-- ============================================================
INSERT INTO vehicle_info (plate_number, make, model, year, body_style, color, engine_cc, fuel_type, wof_expiry, wof_status, rego_expiry, rego_status, first_registered, odometer_readings, fetched_at)
VALUES
  ('ABC123', 'Toyota', 'Corolla', 2019, 'Hatchback', 'Silver', 1800, 'Petrol',
   '2026-08-15', 'Current', '2026-06-20', 'Current', '2019-03-10',
   '[{"date":"2026-01-10","reading":45000},{"date":"2025-07-15","reading":38500},{"date":"2025-01-20","reading":31000},{"date":"2024-07-25","reading":24000}]'::jsonb,
   now()),
  ('XYZ789', 'Mazda', 'CX-5', 2020, 'SUV', 'Red', 2200, 'Diesel',
   '2026-09-01', 'Current', '2026-07-15', 'Current', '2020-05-22',
   '[{"date":"2026-01-05","reading":38000},{"date":"2025-06-20","reading":30000},{"date":"2024-12-10","reading":22000}]'::jsonb,
   now()),
  ('DEF456', 'Nissan', 'Leaf', 2021, 'Hatchback', 'White', 0, 'Electric',
   '2026-11-20', 'Current', '2026-10-05', 'Current', '2021-02-14',
   '[{"date":"2026-01-08","reading":25000},{"date":"2025-07-01","reading":19000}]'::jsonb,
   now()),
  ('GHI101', 'Ford', 'Ranger', 2022, 'Ute', 'Blue', 2000, 'Diesel',
   '2026-07-30', 'Current', '2026-08-12', 'Current', '2022-01-18',
   '[{"date":"2026-01-12","reading":55000},{"date":"2025-06-15","reading":42000},{"date":"2024-12-20","reading":30000}]'::jsonb,
   now()),
  ('JKL202', 'Honda', 'CR-V', 2018, 'SUV', 'Black', 1500, 'Petrol',
   '2026-05-10', 'Current', '2026-04-22', 'Current', '2018-06-30',
   '[{"date":"2026-01-15","reading":72000},{"date":"2025-07-10","reading":63000},{"date":"2025-01-05","reading":55000},{"date":"2024-07-12","reading":47000}]'::jsonb,
   now()),
  ('MNO303', 'Subaru', 'Outback', 2021, 'Wagon', 'Green', 2500, 'Petrol',
   '2026-10-15', 'Current', '2026-09-28', 'Current', '2021-04-05',
   '[{"date":"2026-01-20","reading":42000},{"date":"2025-07-25","reading":34000},{"date":"2025-01-30","reading":26000}]'::jsonb,
   now()),
  ('PQR404', 'Hyundai', 'Kona', 2023, 'SUV', 'Orange', 1600, 'Hybrid',
   '2026-12-01', 'Current', '2026-11-15', 'Current', '2023-03-20',
   '[{"date":"2026-01-18","reading":15000},{"date":"2025-09-10","reading":10000}]'::jsonb,
   now()),
  ('STU505', 'Volkswagen', 'Golf', 2020, 'Hatchback', 'Grey', 1400, 'Petrol',
   '2026-06-25', 'Current', '2026-05-30', 'Current', '2020-08-12',
   '[{"date":"2026-01-22","reading":48000},{"date":"2025-07-18","reading":40000},{"date":"2025-01-15","reading":32000}]'::jsonb,
   now()),
  ('WXY666', 'Mitsubishi', 'Outlander', 2019, 'SUV', 'White', 2400, 'Petrol',
   '2026-03-15', 'Current', '2026-02-28', 'Current', '2019-07-22',
   '[{"date":"2025-12-01","reading":68000},{"date":"2025-06-10","reading":60000},{"date":"2024-12-15","reading":52000}]'::jsonb,
   now()),
  ('TEST001', 'Honda', 'Civic', 2017, 'Sedan', 'Blue', 1500, 'Petrol',
   '2025-12-01', 'Expired', '2026-02-28', 'Current', '2017-08-15',
   '[{"date":"2025-06-01","reading":95000},{"date":"2024-06-15","reading":82000}]'::jsonb,
   now())
ON CONFLICT (plate_number) DO NOTHING;

-- ============================================================
-- 6. Price history (initial + some price drops)
-- ============================================================
INSERT INTO price_history (listing_id, price, changed_at) VALUES
  -- Toyota Corolla: listed at $26,490, dropped to $24,990
  ('b1111111-1111-1111-1111-111111111111', 26490.00, now() - interval '20 days'),
  ('b1111111-1111-1111-1111-111111111111', 24990.00, now() - interval '10 days'),
  -- Mazda CX-5: stable
  ('b2222222-2222-2222-2222-222222222222', 38500.00, now() - interval '21 days'),
  -- Nissan Leaf: listed at $34,000, dropped to $32,000
  ('b3333333-3333-3333-3333-333333333333', 34000.00, now() - interval '22 days'),
  ('b3333333-3333-3333-3333-333333333333', 32000.00, now() - interval '12 days'),
  -- Ford Ranger: stable
  ('b4444444-4444-4444-4444-444444444444', 52000.00, now() - interval '23 days'),
  -- Honda CR-V: listed at $30,000, dropped twice
  ('b5555555-5555-5555-5555-555555555555', 30000.00, now() - interval '24 days'),
  ('b5555555-5555-5555-5555-555555555555', 29000.00, now() - interval '14 days'),
  ('b5555555-5555-5555-5555-555555555555', 28500.00, now() - interval '7 days'),
  -- Subaru Outback: stable
  ('b6666666-6666-6666-6666-666666666666', 42990.00, now() - interval '25 days'),
  -- Hyundai Kona: stable
  ('b7777777-7777-7777-7777-777777777777', 39900.00, now() - interval '26 days'),
  -- VW Golf: listed at $31,990, dropped to $29,990
  ('b8888888-8888-8888-8888-888888888888', 31990.00, now() - interval '27 days'),
  ('b8888888-8888-8888-8888-888888888888', 29990.00, now() - interval '15 days'),
  -- Outlander (SOLD): sold at listing price
  ('b9999999-9999-9999-9999-999999999999', 26500.00, now() - interval '45 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. Favorites (John favorites several listings + price alert)
-- ============================================================
INSERT INTO favorites (user_id, listing_id, price_alert, target_price, created_at) VALUES
  -- John favorites Toyota Corolla with price alert at $22,000
  ('a5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', true, 22000.00, now() - interval '15 days'),
  -- John favorites Nissan Leaf
  ('a5555555-5555-5555-5555-555555555555', 'b3333333-3333-3333-3333-333333333333', false, NULL, now() - interval '14 days'),
  -- John favorites Honda CR-V with price alert at $25,000
  ('a5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', true, 25000.00, now() - interval '10 days'),
  -- John favorites VW Golf
  ('a5555555-5555-5555-5555-555555555555', 'b8888888-8888-8888-8888-888888888888', false, NULL, now() - interval '8 days'),
  -- Emma favorites Ford Ranger
  ('a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', false, NULL, now() - interval '12 days'),
  -- Emma favorites Subaru Outback with price alert at $38,000
  ('a3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666', true, 38000.00, now() - interval '9 days'),
  -- Mike favorites Toyota Corolla
  ('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', false, NULL, now() - interval '18 days')
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- ============================================================
-- 8. Messages (sample conversations)
-- ============================================================
INSERT INTO messages (sender_id, receiver_id, listing_id, content, is_read, created_at) VALUES
  -- Conversation 1: John asks Sarah about Toyota Corolla
  ('a5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'Hi Sarah, is the Corolla still available? Looks like a great car!', true, now() - interval '5 days'),
  ('a1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111',
   'Hi John! Yes it is. Would you like to arrange a viewing?', true, now() - interval '5 days' + interval '2 hours'),
  ('a5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'That would be great! Are you available this Saturday morning?', true, now() - interval '5 days' + interval '4 hours'),
  ('a1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111',
   'Saturday 10am works for me. I''m in Mt Eden, Auckland. I''ll send you the address.', true, now() - interval '4 days'),
  ('a5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'Perfect, see you then! Also, has the car had any mechanical issues?', false, now() - interval '3 days'),

  -- Conversation 2: Emma asks David about Ford Ranger
  ('a3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444',
   'Hi David, what''s the towing capacity on the Ranger?', true, now() - interval '8 days'),
  ('a4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'Hey Emma! It''s rated at 3,500kg braked. I''ve used it to tow a boat with no issues.', true, now() - interval '8 days' + interval '3 hours'),
  ('a3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444',
   'That''s exactly what I need. Would you consider $49,000?', true, now() - interval '7 days'),
  ('a4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444',
   'I could do $50,500 — it''s had a lot of accessories added. Happy to discuss in person.', false, now() - interval '6 days'),

  -- Conversation 3: Mike asks Sarah about Honda CR-V
  ('a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555',
   'Hi, I saw the CR-V is manual transmission. Is it easy to drive in city traffic?', true, now() - interval '10 days'),
  ('a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555',
   'Hey Mike! The clutch is really light and smooth, great for around town. My wife drove it daily to work in the CBD with no issues.', true, now() - interval '10 days' + interval '1 hour'),
  ('a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555',
   'Good to hear. I''ll think about it and get back to you. Cheers!', true, now() - interval '9 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. Lookup quotas
-- ============================================================
INSERT INTO lookup_quotas (user_id, count, reset_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', 2, now() + interval '1 day'),
  ('a2222222-2222-2222-2222-222222222222', 0, now() + interval '1 day'),
  ('a3333333-3333-3333-3333-333333333333', 5, now() + interval '1 day'),
  ('a4444444-4444-4444-4444-444444444444', 1, now() + interval '1 day'),
  ('a5555555-5555-5555-5555-555555555555', 3, now() + interval '1 day')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 10. Storage buckets (for image uploads)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- ============================================================
-- Done!
-- ============================================================
-- Test accounts (password: Test1234!):
--   sarah@test.com  — Sarah  (Auckland)     — 3 listings (Corolla, CR-V, Swift draft)
--   mike@test.com   — Mike   (Wellington)   — 2 listings (CX-5, Outback)
--   emma@test.com   — Emma   (Canterbury)   — 2 listings (Leaf, Kona)
--   david@test.com  — David  (Waikato)      — 2 listings (Ranger, Golf)
--   john@test.com   — John   (Auckland)     — 1 listing  (Outlander, SOLD)

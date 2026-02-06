import { supabaseAdmin } from '@/config/supabase';
import logger from '@/utils/logger';

const TEST_USERS = [
  { email: 'sarah@test.com', password: 'Test1234!', nickname: 'Sarah', region: 'Auckland', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { email: 'mike@test.com', password: 'Test1234!', nickname: 'Mike', region: 'Wellington', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
  { email: 'emma@test.com', password: 'Test1234!', nickname: 'Emma', region: 'Canterbury', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' },
  { email: 'david@test.com', password: 'Test1234!', nickname: 'David', region: 'Waikato', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' },
  { email: 'john@test.com', password: 'Test1234!', nickname: 'John', region: 'Auckland', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
];

const LISTINGS = [
  {
    plate_number: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2019,
    body_type: 'Hatchback', fuel_type: 'PETROL', transmission: 'AUTOMATIC',
    color: 'Silver', mileage: 45000, price: 24990,
    description: 'Well-maintained Toyota Corolla with full service history. One owner from new, always garaged. Features include reversing camera, Bluetooth connectivity, and cruise control. Recent WOF and registration. Perfect reliable daily driver.',
    ai_description: 'This 2019 Toyota Corolla represents excellent value with its low mileage and comprehensive service history. The automatic transmission and fuel-efficient petrol engine make it ideal for city commuting, while the hatchback body style offers practical cargo space.',
    region: 'Auckland', seller_index: 0,
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    ],
    days_ago: 20,
  },
  {
    plate_number: 'XYZ789', make: 'Mazda', model: 'CX-5', year: 2020,
    body_type: 'SUV', fuel_type: 'DIESEL', transmission: 'AUTOMATIC',
    color: 'Soul Red', mileage: 38000, price: 38500,
    description: 'Stunning Mazda CX-5 in Soul Red Crystal. Top of the line Limited model with all the extras including leather seats, sunroof, heads-up display, and 360-degree camera. Diesel engine provides excellent fuel economy for long trips.',
    region: 'Wellington', seller_index: 1,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    ],
    days_ago: 21,
  },
  {
    plate_number: 'DEF456', make: 'Nissan', model: 'Leaf', year: 2021,
    body_type: 'Hatchback', fuel_type: 'ELECTRIC', transmission: 'AUTOMATIC',
    color: 'White', mileage: 25000, price: 32000,
    description: 'Go green with this excellent Nissan Leaf! 40kWh battery with great range for daily driving. Includes home charging cable. Battery health at 94%. Perfect for commuting with virtually no running costs.',
    region: 'Canterbury', seller_index: 2,
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
    ],
    days_ago: 22,
  },
  {
    plate_number: 'GHI101', make: 'Ford', model: 'Ranger', year: 2022,
    body_type: 'Ute', fuel_type: 'DIESEL', transmission: 'AUTOMATIC',
    color: 'Blue', mileage: 55000, price: 52000,
    description: 'Ford Ranger Wildtrak with all the bells and whistles. Tow bar fitted, sports bar, tub liner, and premium sound system. Used for light towing only. Excellent condition inside and out.',
    region: 'Waikato', seller_index: 3,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    days_ago: 23,
  },
  {
    plate_number: 'JKL202', make: 'Honda', model: 'CR-V', year: 2018,
    body_type: 'SUV', fuel_type: 'PETROL', transmission: 'MANUAL',
    color: 'Black', mileage: 72000, price: 28500,
    description: 'Reliable Honda CR-V with plenty of life left. 1.5L turbo engine with impressive fuel economy. Family-sized with flexible rear seating. Apple CarPlay and Android Auto. All services done at Honda dealer.',
    region: 'Bay of Plenty', seller_index: 0,
    images: [
      'https://images.unsplash.com/photo-1568844293986-8c2a5c9b9d64?w=800',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    ],
    days_ago: 24,
  },
  {
    plate_number: 'MNO303', make: 'Subaru', model: 'Outback', year: 2021,
    body_type: 'Wagon', fuel_type: 'PETROL', transmission: 'AUTOMATIC',
    color: 'Green', mileage: 42000, price: 42990,
    description: 'Subaru Outback Premium with EyeSight driver assist technology. Symmetrical all-wheel drive perfect for NZ conditions. X-Mode for off-road capability. Roof rails and tow bar included.',
    region: 'Otago', seller_index: 1,
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    ],
    days_ago: 25,
  },
  {
    plate_number: 'PQR404', make: 'Hyundai', model: 'Kona', year: 2023,
    body_type: 'SUV', fuel_type: 'HYBRID', transmission: 'AUTOMATIC',
    color: 'Orange', mileage: 15000, price: 39900,
    description: 'Nearly new Hyundai Kona Hybrid with remaining factory warranty. Outstanding fuel economy - averaging 4.5L/100km. Bold Ignite Flame color turns heads. Loaded with safety features and tech.',
    region: 'Auckland', seller_index: 2,
    images: [
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    ],
    days_ago: 26,
  },
  {
    plate_number: 'STU505', make: 'Volkswagen', model: 'Golf', year: 2020,
    body_type: 'Hatchback', fuel_type: 'PETROL', transmission: 'AUTOMATIC',
    color: 'Grey', mileage: 48000, price: 29990,
    description: 'Volkswagen Golf TSI with turbocharged engine. German engineering at its finest. Premium interior quality with digital cockpit display. Adaptive cruise control and lane keep assist. Drives like new.',
    region: 'Wellington', seller_index: 3,
    images: [
      'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    ],
    days_ago: 27,
  },
];

const VEHICLE_CACHE = [
  {
    plate_number: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2019,
    body_style: 'Hatchback', color: 'Silver', engine_cc: 1800, fuel_type: 'Petrol',
    wof_expiry: '2026-08-15', wof_status: 'Current', rego_expiry: '2026-06-20', rego_status: 'Current',
    first_registered: '2019-03-10',
    odometer_readings: [
      { date: '2026-01-10', reading: 45000 },
      { date: '2025-07-15', reading: 38500 },
      { date: '2025-01-20', reading: 31000 },
      { date: '2024-07-25', reading: 24000 },
    ],
  },
  {
    plate_number: 'XYZ789', make: 'Mazda', model: 'CX-5', year: 2020,
    body_style: 'SUV', color: 'Red', engine_cc: 2200, fuel_type: 'Diesel',
    wof_expiry: '2026-09-01', wof_status: 'Current', rego_expiry: '2026-07-15', rego_status: 'Current',
    first_registered: '2020-05-22',
    odometer_readings: [
      { date: '2026-01-05', reading: 38000 },
      { date: '2025-06-20', reading: 30000 },
      { date: '2024-12-10', reading: 22000 },
    ],
  },
  {
    plate_number: 'TEST001', make: 'Honda', model: 'Civic', year: 2017,
    body_style: 'Sedan', color: 'Blue', engine_cc: 1500, fuel_type: 'Petrol',
    wof_expiry: '2025-12-01', wof_status: 'Expired', rego_expiry: '2026-02-28', rego_status: 'Current',
    first_registered: '2017-08-15',
    odometer_readings: [
      { date: '2025-06-01', reading: 95000 },
      { date: '2024-06-15', reading: 82000 },
    ],
  },
];

async function seed() {
  console.log('Starting seed...\n');

  // 1. Create test users
  console.log('Creating test users...');
  const userIds: string[] = [];

  for (const u of TEST_USERS) {
    // Check if user already exists
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const found = existing?.users?.find((eu) => eu.email === u.email);

    if (found) {
      console.log(`  User ${u.email} already exists (${found.id})`);
      userIds.push(found.id);

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({ nickname: u.nickname, region: u.region, avatar_url: u.avatar })
        .eq('id', found.id);
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { nickname: u.nickname },
      });

      if (error) {
        console.error(`  Failed to create ${u.email}:`, error.message);
        continue;
      }

      console.log(`  Created ${u.email} (${data.user.id})`);
      userIds.push(data.user.id);

      // Update profile with extra fields
      await supabaseAdmin
        .from('profiles')
        .update({ nickname: u.nickname, region: u.region, avatar_url: u.avatar })
        .eq('id', data.user.id);
    }
  }

  if (userIds.length === 0) {
    console.error('No users created. Aborting seed.');
    process.exit(1);
  }

  // 2. Seed vehicle info cache
  console.log('\nSeeding vehicle info cache...');
  for (const v of VEHICLE_CACHE) {
    const { error } = await supabaseAdmin
      .from('vehicle_info')
      .upsert({ ...v, fetched_at: new Date().toISOString() }, { onConflict: 'plate_number' });

    if (error) {
      console.error(`  Failed to seed vehicle ${v.plate_number}:`, error.message);
    } else {
      console.log(`  Cached ${v.plate_number}`);
    }
  }

  // 3. Seed listings
  console.log('\nSeeding listings...');
  const listingIds: string[] = [];

  for (const l of LISTINGS) {
    const userId = userIds[l.seller_index % userIds.length];
    const createdAt = new Date(Date.now() - l.days_ago * 24 * 60 * 60 * 1000).toISOString();

    // Check if listing already exists for this plate
    const { data: existing } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('plate_number', l.plate_number)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  Listing for ${l.plate_number} already exists (${existing[0].id})`);
      listingIds.push(existing[0].id);
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert({
        user_id: userId,
        plate_number: l.plate_number,
        make: l.make,
        model: l.model,
        year: l.year,
        mileage: l.mileage,
        price: l.price,
        description: l.description,
        ai_description: l.ai_description || null,
        status: 'ACTIVE',
        region: l.region,
        fuel_type: l.fuel_type,
        transmission: l.transmission,
        body_type: l.body_type,
        color: l.color,
        views: Math.floor(Math.random() * 400) + 50,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Failed to seed listing ${l.plate_number}:`, error.message);
      continue;
    }

    console.log(`  Created listing ${l.plate_number} (${data.id})`);
    listingIds.push(data.id);

    // Insert images
    for (let i = 0; i < l.images.length; i++) {
      await supabaseAdmin
        .from('listing_images')
        .insert({
          listing_id: data.id,
          image_url: l.images[i],
          order: i,
        });
    }

    // Insert price history
    await supabaseAdmin
      .from('price_history')
      .insert({
        listing_id: data.id,
        price: l.price,
        changed_at: createdAt,
      });
  }

  // 4. Seed some favorites
  if (userIds.length >= 2 && listingIds.length >= 3) {
    console.log('\nSeeding favorites...');
    const buyerId = userIds[userIds.length - 1]; // Last user (John)

    for (let i = 0; i < Math.min(3, listingIds.length); i++) {
      const { error } = await supabaseAdmin
        .from('favorites')
        .upsert({
          user_id: buyerId,
          listing_id: listingIds[i],
          price_alert: i === 0,
          target_price: i === 0 ? 22000 : null,
        }, { onConflict: 'user_id,listing_id' });

      if (!error) {
        console.log(`  Favorited listing ${i + 1} for ${TEST_USERS[userIds.length - 1].email}`);
      }
    }
  }

  // 5. Seed a sample conversation
  if (userIds.length >= 2 && listingIds.length >= 1) {
    console.log('\nSeeding sample messages...');
    const buyerId = userIds[userIds.length - 1];
    const sellerId = userIds[0];
    const listingId = listingIds[0];

    const messages = [
      { sender_id: buyerId, receiver_id: sellerId, content: 'Hi, is this car still available?' },
      { sender_id: sellerId, receiver_id: buyerId, content: 'Yes it is! Would you like to arrange a viewing?' },
      { sender_id: buyerId, receiver_id: sellerId, content: 'That would be great. Are you available this weekend?' },
    ];

    for (let i = 0; i < messages.length; i++) {
      const created = new Date(Date.now() - (3 - i) * 3600000).toISOString();
      await supabaseAdmin
        .from('messages')
        .insert({
          ...messages[i],
          listing_id: listingId,
          is_read: i < 2,
          created_at: created,
        });
    }
    console.log('  Created 3 sample messages');
  }

  // 6. Seed lookup quotas
  console.log('\nSeeding lookup quotas...');
  for (const userId of userIds) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from('lookup_quotas')
      .upsert({
        user_id: userId,
        count: 0,
        reset_at: tomorrow,
      }, { onConflict: 'user_id' });
  }
  console.log(`  Initialized quotas for ${userIds.length} users`);

  console.log('\nSeed complete!');
  console.log(`\nTest accounts (password: Test1234!):`);
  for (let i = 0; i < TEST_USERS.length; i++) {
    console.log(`  ${TEST_USERS[i].email} — ${TEST_USERS[i].nickname} (${TEST_USERS[i].region})`);
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

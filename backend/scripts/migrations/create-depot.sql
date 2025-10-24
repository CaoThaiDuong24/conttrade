INSERT INTO depots (id, name, code, address, province, capacity_teu, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Depot TP.HCM',
  'HCM01',
  'Quận 7, TP.HCM',
  'TP.HCM',
  5000,
  NOW()
) ON CONFLICT (id) DO NOTHING;
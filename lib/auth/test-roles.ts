// Test roles helper for development
export const TEST_ROLES = {
  guest: 'guest',
  buyer: 'buyer', 
  seller: 'seller',
  depot_staff: 'depot_staff',
  depot_manager: 'depot_manager',
  admin: 'admin'
} as const;

export type TestRole = typeof TEST_ROLES[keyof typeof TEST_ROLES];

// Development only - initialize test data
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Test roles initialized for development');
}
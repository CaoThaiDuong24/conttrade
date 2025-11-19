
// Validation function for listing status
export const isValidListingStatus = (status: string): boolean => {
  const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'SOLD', 'RENTED', 'ARCHIVED', 'REJECTED'];
  return validStatuses.includes(status);
};

// Get all valid listing statuses
export const getValidListingStatuses = () => {
  return ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'SOLD', 'RENTED', 'ARCHIVED', 'REJECTED'];
};

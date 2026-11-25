// Items expiring within this many calendar days need attention.
const EXPIRING_SOON_THRESHOLD = 3;

const toUtcCalendarDay = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

// Compare calendar days rather than elapsed 24-hour periods so an item
// expiring today does not become "expired" later in the afternoon.
export const getDaysUntilExpiry = (expiryDate: Date): number => {
  const today = new Date();
  return Math.round((toUtcCalendarDay(expiryDate) - toUtcCalendarDay(today)) / 86_400_000);
};

export const isExpired = (expiryDate: Date): boolean =>
  getDaysUntilExpiry(expiryDate) < 0;

export const isExpiringSoon = (expiryDate: Date): boolean => {
  const days = getDaysUntilExpiry(expiryDate);
  return days >= 0 && days <= EXPIRING_SOON_THRESHOLD;
};

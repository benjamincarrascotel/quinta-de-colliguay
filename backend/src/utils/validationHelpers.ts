// ============================================
// VALIDATION HELPERS
// ============================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidChileanPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 9;
};

export const formatPhoneForWhatsApp = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `56${cleanPhone}`;
};

export const generateWhatsAppUrl = (phone: string, message?: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${formattedPhone}${encodedMessage}`;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

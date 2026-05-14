// Email validation
export function isValidEmail(email) {
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return regex.test(email);
}

// Password validation (min 8 chars, at least one uppercase, one number)
export function isValidPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// Phone number validation (Kenyan format)
export function isValidPhone(phone) {
  const regex = /^(07|01|25)\d{8}$/;
  return regex.test(phone);
}

// Full name validation
export function isValidFullName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
}

// Validate form
export function validateForm(fields) {
  const errors = {};
  if (fields.email && !isValidEmail(fields.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (fields.password && !isValidPassword(fields.password)) {
    errors.password = 'Password must be at least 8 characters with 1 uppercase and 1 number';
  }
  if (fields.fullName && !isValidFullName(fields.fullName)) {
    errors.fullName = 'Full name must be between 2 and 100 characters';
  }
  if (fields.phone && fields.phone && !isValidPhone(fields.phone)) {
    errors.phone = 'Please enter a valid Kenyan phone number (07XXXXXXXX)';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

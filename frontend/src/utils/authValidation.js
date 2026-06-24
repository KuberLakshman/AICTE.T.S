const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;

const isBlank = (value) => String(value || '').trim() === '';

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (isBlank(email)) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (isBlank(password)) {
    errors.password = 'Password is required.';
  }

  return errors;
};

export const validateStudentRegistration = (formData) => {
  const errors = {};

  if (isBlank(formData.full_name)) errors.full_name = 'Full name is required.';
  if (isBlank(formData.usn)) errors.usn = 'USN is required.';

  if (isBlank(formData.email)) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    errors.email = 'Enter a valid email address.';
  } else if (!formData.email.trim().toLowerCase().endsWith('@vvce.ac.in')) {
    errors.email = 'Use your VVCE email address ending with @vvce.ac.in.';
  }

  if (!isBlank(formData.phone) && !PHONE_PATTERN.test(formData.phone.trim())) {
    errors.phone = 'Enter a 10-digit phone number using digits only.';
  }

  if (isBlank(formData.branch)) errors.branch = 'Select a branch.';

  if (isBlank(formData.semester)) {
    errors.semester = 'Semester is required.';
  } else {
    const semester = Number(formData.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      errors.semester = 'Enter a semester from 1 to 8.';
    }
  }

  if (isBlank(formData.section)) errors.section = 'Section is required.';

  if (isBlank(formData.password)) {
    errors.password = 'Password is required.';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return errors;
};

export const validateTeacherRegistration = (formData) => {
  const errors = {};

  if (isBlank(formData.full_name)) errors.full_name = 'Full name is required.';

  if (isBlank(formData.email)) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (isBlank(formData.branch)) errors.branch = 'Select a branch.';

  if (isBlank(formData.password)) {
    errors.password = 'Password is required.';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return errors;
};

export const getServerFieldErrors = (error) => {
  const message = error.response?.data?.message || '';

  if (message.includes('Invalid Email or Password')) {
    return {
      email: 'No account matches this email and password combination.',
      password: 'Check that this password belongs to the email entered.'
    };
  }

  if (message.includes('Only VVCE emails')) {
    return { email: 'Use your VVCE email address ending with @vvce.ac.in.' };
  }

  if (message.includes('USN is already registered')) {
    return { usn: 'This USN is already registered. Use a different USN or log in.' };
  }

  if (message.includes('Email is already registered')) {
    return { email: 'This email is already registered. Use a different email or log in.' };
  }

  if (message.includes('teacher email is already registered')) {
    return { email: 'This teacher email is already registered. Use a different email or log in.' };
  }

  if (message.includes('Database Error')) {
    return { form: 'The server could not check your details right now. Please try again.' };
  }

  return { form: message || 'Please check the highlighted fields and try again.' };
};

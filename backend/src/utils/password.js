/**
 * BR-10: Password Complexity Policy
 * "The password entered by a user during new registration or password reset must be between 8 and 32 characters long,
 * must not contain any spaces, and must not be identical to the username."
 */
const validatePasswordComplexity = (password, username) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required.',
    };
  }

  if (password.length < 8 || password.length > 32) {
    return {
      isValid: false,
      message: 'Password must be between 8 and 32 characters long.',
    };
  }

  if (/\s/.test(password)) {
    return {
      isValid: false,
      message: 'Password must not contain any spaces.',
    };
  }

  if (username && password.toLowerCase() === username.trim().toLowerCase()) {
    return {
      isValid: false,
      message: 'Password must not be identical to the username.',
    };
  }

  return {
    isValid: true,
  };
};

module.exports = {
  validatePasswordComplexity,
};

let types = {
  // Signup
  SIGNUP_REQUEST: '',
  SIGNUP_SUCCESS: '',
  SIGNUP_FAIL: '',

  // Login
  LOGIN_REQUEST: '',
  LOGIN_SUCCESS: '',
  LOGIN_FAIL: '',

  // Get self
  GET_ME_REQUEST: '',
  GET_ME_SUCCESS: '',
  GET_ME_FAIL: '',

  // Logout
  LOGOUT_SUCCESS: '',

  // Request resend verification email
  POST_REQUEST_RESEND_VERIFICATION_EMAIL_REQUEST: '',
  POST_REQUEST_RESEND_VERIFICATION_EMAIL_SUCCESS: '',
  POST_REQUEST_RESEND_VERIFICATION_EMAIL_FAIL: '',

  // Verify email
  POST_VERIFY_EMAIL_REQUEST: '',
  POST_VERIFY_EMAIL_SUCCESS: '',
  POST_VERIFY_EMAIL_FAIL: '',

  // Request password reset email
  POST_REQUEST_PWD_RESET_REQUEST: '',
  POST_REQUEST_PWD_RESET_SUCCESS: '',
  POST_REQUEST_PWD_RESET_FAIL: '',

  // Verify password reset token
  POST_VERIFY_PWD_RESET_TOKEN_REQUEST: '',
  POST_VERIFY_PWD_RESET_TOKEN_SUCCESS: '',
  POST_VERIFY_PWD_RESET_TOKEN_FAIL: '',

  // Reset password
  POST_PWD_RESET_REQUEST: '',
  POST_PWD_RESET_SUCCESS: '',
  POST_PWD_RESET_FAIL: '',

};

if (process.env.NODE_ENV === 'production') {
  let idx = Math.floor(Math.random() * 1000);

  for (let prop in types) {
    if (types.hasOwnProperty(prop)) {
      types[prop] = idx++;
    }
  }
} else {
  for (let prop in types) {
    if (types.hasOwnProperty(prop)) {
      types[prop] = prop;
    }
  }
}

export default types;

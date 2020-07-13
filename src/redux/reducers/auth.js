import types from '../types';

const INITIAL_STATE = {
  isPostingSignup: false,
  isPostingLogin: false,
  isFetchingMe: false,

  accessToken: '',
  user: null,

  isPostingRequestResendVerificationEmail: false,
  isPostingVerifyEmail: false,

  isPostingPwdResetRequest: false,
  isPostingVerifyPwdResetToken: false,
  isPostingPwdReset: false,

  isPostingUnsubscribe: false,

  msg: '',
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // Signup
    case types.SIGNUP_REQUEST:
      return {
        ...state,
        isPostingSignup: true,
        msg: '',
      };
    case types.SIGNUP_SUCCESS:
    case types.SIGNUP_FAIL:
      return {
        ...state,
        isPostingSignup: false,
        msg: action.payload.msg,
      };

    // Login
    case types.LOGIN_REQUEST:
      return {
        ...state,
        isPostingLogin: true,
        msg: '',
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        isPostingLogin: false,
        accessToken: action.payload.accessToken,
        msg: action.payload.msg,
        user: action.payload.user || state.user,
      };
    case types.LOGIN_FAIL:
      return {
        ...state,
        isPostingLogin: false,
        accessToken: '',
        msg: action.payload.msg,
      };

    // Get me
    case types.GET_ME_REQUEST:
      return {
        ...state,
        isFetchingMe: true,
        msg: '',
      };
    case types.GET_ME_SUCCESS:
      return {
        ...state,
        isFetchingMe: false,
        user: action.payload.user,
        msg: '',
      };
    case types.GET_ME_FAIL:
      return {
        ...state,
        isFetchingMe: false,
        user: null,
        msg: action.payload.msg,
      };

    // Logout
    case types.LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        accessToken: '',
        msg: action.payload.msg,
      };

    // Resend verify email
    case types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_REQUEST:
      return {
        ...state,
        isPostingRequestResendVerificationEmail: true,
      };

    case types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_SUCCESS:
    case types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_FAIL:
      return {
        ...state,
        isPostingRequestResendVerificationEmail: false,
      };

    // Verify email
    case types.POST_VERIFY_EMAIL_REQUEST:
      return {
        ...state,
        isPostingVerifyEmail: true,
      };

    case types.POST_VERIFY_EMAIL_SUCCESS:
    case types.POST_VERIFY_EMAIL_FAIL:
      return {
        ...state,
        isPostingVerifyEmail: false,
      };

    // Request pwd reset
    case types.POST_REQUEST_PWD_RESET_REQUEST:
      return {
        ...state,
        isPostingPwdResetRequest: true,
      };

    case types.POST_REQUEST_PWD_RESET_SUCCESS:
    case types.POST_REQUEST_PWD_RESET_FAIL:
      return {
        ...state,
        isPostingPwdResetRequest: false,
      };

    // Verify pwd reset token
    case types.POST_VERIFY_PWD_RESET_TOKEN_REQUEST:
      return {
        ...state,
        isPostingVerifyPwdResetToken: true,
      };

    case types.POST_VERIFY_PWD_RESET_TOKEN_SUCCESS:
    case types.POST_VERIFY_PWD_RESET_TOKEN_FAIL:
      return {
        ...state,
        isPostingVerifyPwdResetToken: false,
      };

    // Reset pwd
    case types.POST_PWD_RESET_REQUEST:
      return {
        ...state,
        isPostingPwdReset: true,
      };

    case types.POST_PWD_RESET_SUCCESS:
    case types.POST_PWD_RESET_FAIL:
      return {
        ...state,
        isPostingPwdReset: false,
      };

    // Unsubscribe
    case types.POST_UNSUBSCRIBE_REQUEST:
      return {
        ...state,
        isPostingUnsubscribe: true,
      };

    case types.POST_UNSUBSCRIBE_SUCCESS:
    case types.POST_UNSUBSCRIBE_FAIL:
      return {
        ...state,
        isPostingUnsubscribe: false,
      };

    // Initial state
    default:
      return state;
  }
};

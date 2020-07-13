import types from '../types';
import api from '../api';
import setApiAuthHeader from '../../utils/setApiAuthHeader';

import { history } from '../../index.js';
import notifier from '../../utils/notifier';

export const signup = data => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingSignup) {
    return Promise.reject();
  }

  dispatch({
    type: types.SIGNUP_REQUEST,
  });

  return api.auth.signup(data)
    .then(data => {
      const msg = (data && data.msg) || 'Signup success!';
      const payload = { ...data, msg };

      dispatch({
        type: types.SIGNUP_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Signup failed!';
      const payload = { ...err, msg };

      dispatch({
        type: types.SIGNUP_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const login = credentials => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingLogin) {
    return Promise.reject();
  }

  dispatch({
    type: types.LOGIN_REQUEST,
  });

  return api.auth.login(credentials)
    .then(data => {
      const msg = (data && data.msg) || 'Login success!';
      let payload = { ...data, msg };

      if (!payload.accessToken) {
        return Promise.reject(payload);
      } else {
        localStorage.accessToken = payload.accessToken;
        setApiAuthHeader(payload.accessToken);

        dispatch({
          type: types.LOGIN_SUCCESS,
          payload,
        });

        return payload;
      }
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Login failed!';
      const payload = { ...err, msg };

      dispatch({
        type: types.LOGIN_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const loginWithToken = (accessToken, user) => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingLogin) {
    return Promise.reject();
  }

  dispatch({
    type: types.LOGIN_REQUEST,
  });

  localStorage.accessToken = accessToken;
  setApiAuthHeader(accessToken);

  const payload = {
    msg: 'Login with token',
    accessToken,
    user: JSON.parse(user),
  };

  dispatch({
    type: types.LOGIN_SUCCESS,
    payload,
  });

  return Promise.resolve(payload);
};

export const getMe = () => (dispatch, getState) => {
  if (getState().rootReducer.auth.isFetchingMe) {
    return Promise.reject();
  }

  dispatch({
    type: types.GET_ME_REQUEST,
  });

  return api.auth.getMe()
    .then(data => {
      localStorage.user = JSON.stringify(data);

      dispatch({
        type: types.GET_ME_SUCCESS,
        payload: { user: data },
      });

      return data;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Get failed!';
      const payload = { ...err, msg };

      dispatch({
        type: types.GET_ME_FAIL,
        payload,
      });

      localStorage.clear();
      setApiAuthHeader();

      return Promise.reject(payload);
    });
};

export const logout = () => dispatch => {
  api.auth.logout();

  localStorage.clear();
  setApiAuthHeader();

  dispatch({
    type: types.LOGOUT_SUCCESS,
    payload: {
      msg: 'Logout success!',
    },
  });

  notifier.success('You have been logged out.');

  history.push('/');
};

export const requestResendVerificationEmail = email => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingRequestResendVerificationEmail) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_REQUEST,
  });

  return api.auth.requestVerificationEmail(email)
    .then(data => {
      const msg = (data && data.msg) || 'Request successful!';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Request failed';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_REQUEST_RESEND_VERIFICATION_EMAIL_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const verifyEmail = code => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingVerifyEmail) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_VERIFY_EMAIL_REQUEST,
  });

  return api.auth.verifyEmail(code)
    .then(data => {
      const msg = (data && data.msg) || 'Email verified successfully';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_VERIFY_EMAIL_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Email verification failed';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_VERIFY_EMAIL_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const requestPwdReset = email => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingPwdResetRequest) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_REQUEST_PWD_RESET_REQUEST,
  });

  return api.auth.requestPwdReset(email)
    .then(data => {
      const msg = (data && data.msg) || 'Request successful!';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_REQUEST_PWD_RESET_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Request failed';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_REQUEST_PWD_RESET_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const verifyPwdResetToken = token => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingVerifyPwdResetToken) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_VERIFY_PWD_RESET_TOKEN_REQUEST,
  });

  return api.auth.verifyPwdResetToken(token)
    .then(data => {
      const msg = (data && data.msg) || 'Token verified!';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_VERIFY_PWD_RESET_TOKEN_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Token invalid';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_VERIFY_PWD_RESET_TOKEN_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const resetPwd = (token, password) => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingPwdReset) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_PWD_RESET_REQUEST,
  });

  return api.auth.resetPwd(token, password)
    .then(data => {
      const msg = (data && data.msg) || 'Password changed!';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_PWD_RESET_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Password change failed';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_PWD_RESET_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

export const unsubscribe = (unsubscribeCode, unsubscribeEmail) => (dispatch, getState) => {
  if (getState().rootReducer.auth.isPostingUnsubscribe) {
    return Promise.reject();
  }

  dispatch({
    type: types.POST_UNSUBSCRIBE_REQUEST,
  });

  return api.auth.unsubscribe(unsubscribeCode, unsubscribeEmail)
    .then(data => {
      const msg = (data && data.msg) || 'Unsubscribe successful';
      let payload = { ...data, msg };

      dispatch({
        type: types.POST_UNSUBSCRIBE_SUCCESS,
        payload,
      });

      return payload;
    })
    .catch(err => {
      const msg = (err.response && err.response.data && err.response.data.msg) || 'Unsubscribe failed';
      const payload = { ...err, msg };

      dispatch({
        type: types.POST_UNSUBSCRIBE_FAIL,
        payload,
      });

      return Promise.reject(payload);
    });
};

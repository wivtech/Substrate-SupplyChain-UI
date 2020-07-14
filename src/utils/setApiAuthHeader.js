import axios from 'axios';

export default (accessToken = null) => {
  if (accessToken) {
    axios.defaults.headers.common.authorization = `${accessToken}`;
  } else {
    delete axios.defaults.headers.common.authorization;
  }
};

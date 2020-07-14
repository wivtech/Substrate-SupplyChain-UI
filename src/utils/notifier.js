import { notification } from 'antd';

export default {
  timer: 6,

  setTimer (sec) {
    this.timer = sec;
  },

  success (msg, desc, time) {
    notification.success({
      message: msg,
      description: desc ? desc : '',
      className: desc ? 'notifier-content' : 'notifier-no-content',
      duration: time !== undefined ? time : this.timer
    });
  },

  error (msg, desc, time) {
    notification.error({
      message: msg,
      description: desc ? desc : '',
      className: desc ? 'notifier-content' : 'notifier-no-content',
      duration: time !== undefined ? time : this.timer
    });
  }
};
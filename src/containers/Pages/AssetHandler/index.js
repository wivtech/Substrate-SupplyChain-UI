import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  login,
  getMe,
  requestPwdReset,
  requestResendVerificationEmail,
} from '../../../../redux/actions/auth';

import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  Tabs,
} from 'antd';

import Joi from '../../../../utils/validator';
import notifier from '../../../../utils/notifier';

const TABS = {
  LOGIN: '1',
  RESEND_VERIFICATION: '2',
  FORGOT_PASSWORD: '3',
};

class LoginPage extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      formData: {
        email: '',
        password: '',
      },

      errors: {},

      activeTab: TABS.LOGIN,

      msg: '',
      from: null,
    };

    this.schema = {
      email: Joi.string().label('Email').email().required(),
      password: Joi.string().label('Password').required(),
    };
  }

  handleChange = (val, key) => {
    // Validate individual
    this.setState({
      formData: {
        ...this.state.formData,
        [key]: val,
      },
      errors: {
        ...this.state.errors,
        [key]: Joi.validateToPlainErrors(val, this.schema[key]),
      },
    });
  };

  handleLoginButton = () => {
    // Validate all fields
    const errors = Joi.validateToPlainErrors(this.state.formData, this.schema);
    this.setState({
      errors,
    });

    if (Joi.hasPlainError(errors)) {
      notifier.error('Please fix errors');
      return;
    }

    this.props.login(this.state.formData)
      .then(res => {
        notifier.success(res.msg);
        this.props.getMe()
          .then(() => {
            const redirect =
              (this.props.location
                && this.props.location
                && this.props.location.state
                && this.props.location.state.from)
              || '/';
            this.props.history.push(redirect);
          });
      })
      .catch(err => {
        notifier.error(err.msg);
        if (err.response && err.response.data && err.response.data.errors) {
          this.setState({ errors: err.response.data.errors });
        }

        if (err.response && err.response.status && err.response.status === 401) {
          this.handleActiveResendVerificationTab();
        }
      });
  };

  handleGoToSignupButton = () => {
    this.props.history.push({
      pathname: '/signup',
      state: this.props.location.state,
    });
  };

  handleForgotPasswordButton = () => {
    this.setState({
      activeTab: TABS.FORGOT_PASSWORD,
    });
  };

  handleResetPwdButton = () => {
    // Validate all fields
    const errors = Joi.validateToPlainErrors({ email: this.state.formData.email }, { email: this.schema.email });
    this.setState({
      errors,
    });

    if (Joi.hasPlainError(errors)) {
      notifier.error('Please fix errors');
      return;
    }

    this.props.requestPwdReset(this.state.formData.email)
      .then(res => {
        notifier.success(res.msg);
      })
      .catch(err => {
        notifier.error(err.msg);
        if (err.response && err.response.data && err.response.data.errors) {
          this.setState({ errors: err.response.data.errors });
        }

        if (err.response && err.response.status && err.response.status === 401) {
          this.handleActiveResendVerificationTab();
        }
      });
  };

  handleResendVerificationButton = () => {
    // Validate all fields
    const errors = Joi.validateToPlainErrors({ email: this.state.formData.email }, { email: this.schema.email });
    this.setState({
      errors,
    });

    if (Joi.hasPlainError(errors)) {
      notifier.error('Please fix errors');
      return;
    }

    this.props.requestResendVerificationEmail(this.state.formData.email)
      .then(res => {
        notifier.success(res.msg);
      })
      .catch(err => {
        notifier.error(err.msg);
        if (err.response && err.response.data && err.response.data.errors) {
          this.setState({ errors: err.response.data.errors });
        }
      });
  };

  handleActiveResendVerificationTab = () => {
    this.setState({
      activeTab: TABS.RESEND_VERIFICATION,
    });
  };

  handleTabChange = (activeTab) => {
    this.setState({
      activeTab,
    });
  };

  render () {
    const {
      isPostingLogin,
      isPostingRequestResendVerificationEmail,
      isPostingPwdResetRequest,
      location,
    } = this.props;
    const { errors, formData, activeTab } = this.state;

    const msg = (location.state && location.state.msg) || '';

    return (
      <div>
        <h1><i className="fas fa-sign-in-alt"/> Login Page</h1>

        <Spin spinning={isPostingLogin || isPostingRequestResendVerificationEmail || isPostingPwdResetRequest}>
          {!!msg && <h2>{msg}</h2>}
          <Card>
            <Tabs defaultActiveKey={TABS.LOGIN} activeKey={activeTab} onChange={this.handleTabChange}>

              <Tabs.TabPane tab="Login" key={TABS.LOGIN}>
                <Form.Item
                  label="Email"
                  validateStatus={Joi.getFirstPlainError(errors, 'email') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'email')}
                >
                  <Input
                    value={formData.email}
                    onChange={(e) => { this.handleChange(e.target.value, 'email'); }}
                  />
                </Form.Item>
                <Form.Item
                  label="Password"
                  validateStatus={Joi.getFirstPlainError(errors, 'password') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'password')}
                >
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => { this.handleChange(e.target.value, 'password'); }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={this.handleLoginButton}>Login</Button>
                  <Button type="primary" onClick={this.handleForgotPasswordButton}>ForgotPassword?</Button>
                </Form.Item>
                <Form.Item>
                  <Button onClick={this.handleGoToSignupButton}>Go to Sign up</Button>
                </Form.Item>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Forgot Password" key={TABS.FORGOT_PASSWORD}>
                <Form.Item
                  label="Email"
                  validateStatus={Joi.getFirstPlainError(errors, 'email') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'email')}
                >
                  <Input
                    value={formData.email}
                    onChange={(e) => { this.handleChange(e.target.value, 'email'); }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={this.handleResetPwdButton}>Reset Password</Button>
                </Form.Item>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Resend Verification" key={TABS.RESEND_VERIFICATION}>
                <Form.Item
                  label="Email"
                  validateStatus={Joi.getFirstPlainError(errors, 'email') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'email')}
                >
                  <Input
                    value={formData.email}
                    onChange={(e) => { this.handleChange(e.target.value, 'email'); }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={this.handleResendVerificationButton}>Resend Verification
                    Email</Button>
                </Form.Item>
              </Tabs.TabPane>

            </Tabs>
          </Card>
        </Spin>
      </div>
    );
  }
}

LoginPage.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

  isPostingLogin: PropTypes.bool.isRequired,
  isPostingRequestResendVerificationEmail: PropTypes.bool.isRequired,
  isPostingPwdResetRequest: PropTypes.bool.isRequired,

  login: PropTypes.func.isRequired,
  getMe: PropTypes.func.isRequired,
  requestPwdReset: PropTypes.func.isRequired,
  requestResendVerificationEmail: PropTypes.func.isRequired,
};

const mapStateToProps = store => ({
  isPostingLogin: store.rootReducer.auth.isPostingLogin,
  isPostingRequestResendVerificationEmail: store.rootReducer.auth.isPostingRequestResendVerificationEmail,
  isPostingPwdResetRequest: store.rootReducer.auth.isPostingPwdResetRequest,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  login,
  getMe,
  requestPwdReset,
  requestResendVerificationEmail,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
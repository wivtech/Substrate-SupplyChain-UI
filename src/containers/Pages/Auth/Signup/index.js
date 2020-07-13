import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  signup,
  requestResendVerificationEmail,
} from '../../../../redux/actions/auth';

import {
  DEFAULT_EMAIL_RESEND_COUNTER,
} from '../../../../constants';

import {
  Card,
  Form,
  Input,
  Button,
  Spin,
} from 'antd';

import Joi from '../../../../utils/validator';
import notifier from '../../../../utils/notifier';

class SignupPage extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      formData: {
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
      },
      emailSent: false,
      emailSentMsg: '',
      retryCounter: 0,

      errors: {},
    };

    this.schema = {
      firstName: Joi.string().label('First Name').required(),
      lastName: Joi.string().label('Last Name').required(),
      username: Joi.string().label('Username').required(),
      email: Joi.string().label('Email').email().required(),
      password: Joi.string().label('Password').required(),
    };
  }

  componentDidMount () {
    this.startResendCountDown();
  }

  componentWillUnmount () {
    clearInterval(this.timerId);
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

  handleSignupButton = () => {
    // Validate all fields
    const errors = Joi.validateToPlainErrors(this.state.formData, this.schema);
    this.setState({
      errors,
    });

    if (Joi.hasPlainError(errors)) {
      notifier.error('Please fix errors');
      return;
    }

    this.props.signup(this.state.formData)
      .then(res => {
        notifier.success(res.msg);
        this.setState({
          emailSent: true,
        });
      })
      .catch(err => {
        notifier.error(err.msg);
        if (err.response && err.response.data && err.response.data.errors) {
          this.setState({ errors: err.response.data.errors });
        }
      });
  };

  handleGoToLoginButton = () => {
    this.props.history.push({
      pathname: '/login',
      state: this.props.location.state,
    });
  };

  handleResendVerificationEmail = () => {
    // Validate all fields
    let errors = Joi.validateToPlainErrors({ email: this.state.formData.email }, { email: this.schema.email });

    if (Joi.hasPlainError(errors)) {
      notifier.error(`Invalid email address: ${this.state.formData.email}`);
      return;
    }

    this.props.requestResendVerificationEmail(this.state.formData.email)
      .then(res => {
        notifier.success(res.msg);

        this.setState({
          retryCounter: DEFAULT_EMAIL_RESEND_COUNTER,
        });
      })
      .catch(err => {
        notifier.error(err.msg);
      });
  };

  startResendCountDown = () => {
    this.timerId = setInterval(() => {
      if (this.state.retryCounter > 0) {
        this.setState(prevState => ({
          retryCounter: prevState.retryCounter - 1,
        }));
      }

      if (this.state.retryCounter < 0) {
        this.setState({
          retryCounter: 0,
        });
      }
    }, 1000);
  };

  render () {
    const {
      isPostingSignup,
      isPostingRequestResendVerificationEmail,
      location,
    } = this.props;

    const {
      errors, formData,
      emailSent,
      retryCounter,
    } = this.state;

    const msg = (location.state && location.state.msg) || '';

    return (
      <div>
        <h1><i className="fas fa-user-plus"/> Signup Page</h1>

        <Spin spinning={isPostingSignup || isPostingRequestResendVerificationEmail}>
          {!!msg && <h2>{msg}</h2>}
          {!emailSent
            ? (
              <Card>
                <Form.Item
                  label="First Name"
                  validateStatus={Joi.getFirstPlainError(errors, 'firstName') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'firstName')}
                  required={true}
                >
                  <Input
                    value={formData.firstName}
                    onChange={(e) => { this.handleChange(e.target.value, 'firstName'); }}
                  />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  validateStatus={Joi.getFirstPlainError(errors, 'lastName') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'lastName')}
                  required={true}
                >
                  <Input
                    value={formData.lastName}
                    onChange={(e) => { this.handleChange(e.target.value, 'lastName'); }}
                  />
                </Form.Item>

                <Form.Item
                  label="Username"
                  validateStatus={Joi.getFirstPlainError(errors, 'username') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'username')}
                  required={true}
                >
                  <Input
                    value={formData.username}
                    onChange={(e) => { this.handleChange(e.target.value, 'username'); }}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  validateStatus={Joi.getFirstPlainError(errors, 'email') ? 'error' : ''}
                  help={Joi.getFirstPlainError(errors, 'email')}
                  required={true}
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
                  required={true}
                >
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => { this.handleChange(e.target.value, 'password'); }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={this.handleSignupButton}>SignUp</Button>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={this.handleGoToLoginButton}>Go to Login</Button>
                </Form.Item>
              </Card>
            )
            : (
              <Card>
                <h2>We've sent you verification email, Please check your inbox to verify your email address.</h2>
                <div>
                  <span>If you haven't received verification email, please click button below to send again.</span>

                  <Button onClick={this.handleResendVerificationEmail} disabled={retryCounter > 0}>
                    {retryCounter > 0 ? `You can resend after ${retryCounter}s` : 'Resend Verification Email'}
                  </Button>
                </div>
              </Card>
            )
          }
        </Spin>
      </div>
    );
  }
}

SignupPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  isPostingSignup: PropTypes.bool.isRequired,
  isPostingRequestResendVerificationEmail: PropTypes.bool.isRequired,

  signup: PropTypes.func.isRequired,
  requestResendVerificationEmail: PropTypes.func.isRequired,
};

const mapStateToProps = store => ({
  isPostingSignup: store.rootReducer.auth.isPostingSignup,
  isPostingRequestResendVerificationEmail: store.rootReducer.auth.isPostingRequestResendVerificationEmail,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  signup,
  requestResendVerificationEmail,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SignupPage);
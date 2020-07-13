import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { to } from 'await-to-js';
import pick from 'lodash/pick';

import {
  verifyPwdResetToken,
  resetPwd,
} from '../../../../redux/actions/auth';

import {
  Button,
  Input,
  Spin,
  Card,
  Form,
} from 'antd';

import Joi from '../../../../utils/validator';
import notifier from '../../../../utils/notifier';

class ResetPasswordPage extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      token: '',

      hasCheckedToken: false,
      isTokenValid: false,

      hasFinishedResetPassword: false,
      isSuccessful: false,

      password: '',
      passwordConfirmation: '',

      errors: {},
      msg: '',
    };

    this.schema = {
      password: Joi.string().label('Password').min(6).required(),
      passwordConfirmation: Joi.string().label('Password Confirmation').min(6).required(),
    };
  }

  async componentDidMount () {
    // Get code from url, verify, update status
    const code = this.props.match.params.code;
    if (!code) {
      this.setState({
        hasCheckedToken: true,
        isTokenValid: false,
        msg: 'Invalid request!',
      });

      return;
    }

    this.setState({
      token: code,
    });

    let [err, res] = await to(this.props.verifyPwdResetToken(code));
    if (err) {
      this.setState({
        hasCheckedToken: true,
        isTokenValid: false,
        msg: err.msg,
      });
    } else {
      this.setState({
        hasCheckedToken: true,
        isTokenValid: true,
        msg: res.msg,
      });
    }
  }

  handleChange = (val, key) => {
    // Validate individual
    this.setState({
      [key]: val,
      errors: {
        ...this.state.errors,
        [key]: Joi.validateToPlainErrors(val, this.schema[key]),
      },
    });
  };

  handleResetButton = () => {
    // Validate all fields
    const errors = Joi.validateToPlainErrors(pick(this.state, ['password', 'passwordConfirmation']), this.schema);

    // Manual validation for password confirmation
    if (this.state.password !== this.state.passwordConfirmation) {
      errors['passwordConfirmation'] = 'Password Confirmation does not match to password.';
    }

    this.setState({
      errors,
    });

    if (Joi.hasPlainError(errors)) {
      notifier.error('Please fix errors');
      return;
    }

    this.props.resetPwd(this.state.token, this.state.password)
      .then(res => {
        this.setState({
          hasFinishedResetPassword: true,
          isSuccessful: true,
          msg: res.msg,
        });
      })
      .catch(err => {
        this.setState({
          hasFinishedResetPassword: true,
          isSuccessful: false,
          msg: err.msg,
        });
      });
  };

  render () {
    const {
      hasCheckedToken,
      isTokenValid,
      hasFinishedResetPassword,
      isSuccessful,
      password,
      passwordConfirmation,
      errors,
      msg,
    } = this.state;

    const {
      history,
      isPostingVerifyPwdResetToken,
      isPostingPwdReset,
    } = this.props;

    return (
      <div>
        <Spin spinning={isPostingVerifyPwdResetToken || isPostingPwdReset}>
          <Card>
            {hasCheckedToken
              ? (
                isTokenValid
                  ? (
                    !hasFinishedResetPassword
                      ? (
                        <div className="auth-form">
                          <h1>Reset Password</h1>
                          <h2>Enter new password</h2>
                          <Form.Item
                            label="Password"
                            validateStatus={Joi.getFirstPlainError(errors, 'password') ? 'error' : ''}
                            help={Joi.getFirstPlainError(errors, 'password')}
                            required={true}
                          >
                            <Input
                              value={password}
                              onChange={(e) => { this.handleChange(e.target.value, 'password'); }}
                            />
                          </Form.Item>

                          <Form.Item
                            label="Password Confirmation"
                            validateStatus={Joi.getFirstPlainError(errors, 'passwordConfirmation') ? 'error' : ''}
                            help={Joi.getFirstPlainError(errors, 'passwordConfirmation')}
                            required={true}
                          >
                            <Input
                              value={passwordConfirmation}
                              onChange={(e) => { this.handleChange(e.target.value, 'passwordConfirmation'); }}
                            />
                          </Form.Item>

                          <Form.Item>
                            <Button type="primary" onClick={this.handleResetButton}>Reset Password</Button>
                          </Form.Item>
                        </div>
                      )
                      : (
                        <div className={(isSuccessful ? 'success' : 'fail') + ' email-verify'}>
                          <h2>{msg}</h2>
                          <Button onClick={() => history.push('/login')}>Login</Button>
                        </div>
                      )
                  )
                  : (
                    <div className="email-verify fail">
                      <h2>Invalid Request!</h2>
                    </div>
                  )
              )
              : (
                <div className="email-verify">
                  <h2>Please wait until verifying request...</h2>
                </div>
              )
            }
          </Card>
        </Spin>
      </div>
    );
  }
}

ResetPasswordPage.propTypes = {
  history: PropTypes.any.isRequired,
  location: PropTypes.any.isRequired,
  match: PropTypes.any.isRequired,

  isPostingVerifyPwdResetToken: PropTypes.bool.isRequired,
  isPostingPwdReset: PropTypes.bool.isRequired,

  verifyPwdResetToken: PropTypes.func.isRequired,
  resetPwd: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isPostingVerifyPwdResetToken: state.rootReducer.auth.isPostingVerifyPwdResetToken,
  isPostingPwdReset: state.rootReducer.auth.isPostingPwdReset,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  verifyPwdResetToken,
  resetPwd,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordPage);
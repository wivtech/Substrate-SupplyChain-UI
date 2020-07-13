import { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import $ from 'jquery';

class ScrollToTop extends Component {
  componentDidUpdate (prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      $('.content-view').scrollTop(0);
    }
  }

  render () {
    return this.props.children;
  }
}

ScrollToTop.propTypes = {
  location: PropTypes.any,
  children: PropTypes.any
};

export default withRouter(ScrollToTop);
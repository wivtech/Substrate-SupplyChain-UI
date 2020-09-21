import React, { useReducer } from 'react';
import PropTypes from 'prop-types';

const INIT_STATE = {
  // Selected Account information
  accountMetadata: null
};

const reducer = (state, action) => {
  console.log(`StoreAction: ${action.type}`);

  switch (action.type) {
    case 'SET_ACCOUNT_METADATA':
      return { ...state, accountMetadata: action.payload };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

const StoreContext = React.createContext();

const StoreContextProvider = ({ children }) => {
  const initState = { ...INIT_STATE };
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};

StoreContextProvider.propTypes = {
  children: PropTypes.any
};

export { StoreContextProvider, StoreContext };

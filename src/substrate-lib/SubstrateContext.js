import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import queryString from 'query-string';

import config from 'config';

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

const INIT_STATE = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  types: config.CUSTOM_TYPES,
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
  // Smart contract
  tokenContract: null,
  tokenContractAbi: null,
  tokenContractState: null,
  // Account
  accountAddress: null,
  accountPair: null
};

const reducer = (state, action) => {
  let socket = null;

  console.log(`Action: ${action.type}`);

  switch (action.type) {
    case 'RESET_SOCKET':
      socket = action.payload || state.socket;
      return { ...state, socket, api: null, apiState: null };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' };

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' };

    case 'KEYRING_NO_ACCOUNTS':
      return { ...state, keyringState: 'NO_ACCOUNTS' };

    case 'SET_CONTRACT_DATA':
      console.log('ACTION: SetContractData', action.payload.tokenContract);
      return { ...state, ...action.payload };

    case 'CONTRACT_ERROR':
      return { ...state, tokenContractState: 'ERROR' };

    case 'SET_ACCOUNT_ADDRESS':
      return { ...state, accountAddress: action.payload.accountAddress, accountPair: action.payload.accountPair };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

const SubstrateContext = React.createContext();

const SubstrateContextProvider = (props) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ['socket', 'types'];
  neededPropNames.forEach(key => {
    initState[key] = (typeof props[key] === 'undefined' ? initState[key] : props[key]);
  });
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <SubstrateContext.Provider value={[state, dispatch]}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
  types: PropTypes.object
};

export { SubstrateContext, SubstrateContextProvider };

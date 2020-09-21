import { useContext, useEffect, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { u8aToString } from '@polkadot/util';
import { Abi, PromiseContract } from '@polkadot/api-contract';
import keyring from '@polkadot/ui-keyring';

import config from 'config';
import { SubstrateContext } from './SubstrateContext';
import { trim } from 'utils/strings';

import TOKEN_CONTRACT_ABI from 'contract-abi/metadata.json';

const useSubstrate = () => {
  const [state, dispatch] = useContext(SubstrateContext);

  const { api, socket, jsonrpc, types, keyringState, apiState, tokenContract, tokenContractAbi, accountAddress, accountPair } = state;

  // `useCallback` so that returning memoized function and not created
  //   everytime, and thus re-render.
  const connect = useCallback(async () => {
    if (api) return;

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, types, rpc: jsonrpc });

    // We want to listen to event for disconnection and reconnection.
    //  That's why we set for listeners.
    _api.on('connected', () => {
      dispatch({ type: 'CONNECT', payload: _api });
      // `ready` event is not emitted upon reconnection. So we check explicitly here.
      _api.isReady.then((_api) => dispatch({ type: 'CONNECT_SUCCESS' }));
    });
    _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
    _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }));
  }, [api, socket, jsonrpc, types, dispatch]);

  // hook to get injected accounts
  const loadAccounts = useCallback(async () => {
    // Ensure the method only run once.
    if (keyringState) return;

    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();
      console.log('Accounts Found: ', allAccounts);

      allAccounts = allAccounts.map(({ address, meta }) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }));

      keyring.loadAll({ isDevelopment: config.DEVELOPMENT_KEYRING }, allAccounts);

      // By default select account from polkadot-js if possible, then other accounts (might be from dev env)`
      if (allAccounts.length) {
        let account = allAccounts.find(account => account.meta.source === 'polkadot-js');
        if (!account) {
          account = allAccounts[0].address;
        }

        const accountPair = account && keyring.getPair(account.address);

        dispatch({ type: 'SET_ACCOUNT_ADDRESS', payload: { accountAddress: account.address, accountPair } });
        dispatch({ type: 'SET_KEYRING', payload: keyring });
      } else {
        console.error(Error('No accounts available'));
        dispatch({ type: 'KEYRING_NO_ACCOUNTS' });
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: 'KEYRING_ERROR' });
    }
  }, [keyringState, dispatch]);

  // hook to initialize contract access
  const loadContract = useCallback(async () => {
    if (tokenContract) return;

    try {
      if (apiState === 'READY' && keyringState === 'READY' && accountAddress) {
        const tokenContractAbi = new Abi(api.registry, TOKEN_CONTRACT_ABI);
        const tokenContract = new PromiseContract(api, tokenContractAbi, config.TOKEN_CONTRACT_ADDRESS);

        dispatch({
          type: 'SET_CONTRACT_DATA',
          payload: {
            tokenContractAbi,
            tokenContract,
            tokenContractState: 'LOADING'
          }
        });

        tokenContract.call('rpc', tokenContract.getMessage('version').def.name, config.callParams.endowment, config.callParams.weight)
          .send(accountAddress)
          .then(res => {
            console.log('=== SC: RPC call version');
            const version = Number.parseInt(res.output.toString());
            console.log(version);

            if (version) {
              dispatch({
                type: 'SET_CONTRACT_DATA',
                payload: { tokenContractState: 'READY' }
              });
            } else {
              dispatch({ type: 'CONTRACT_ERROR' });
            }
          })
          .catch(e => {
            console.log(e);
            dispatch({ type: 'CONTRACT_ERROR' });
          });
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: 'CONTRACT_ERROR' });
    }
  }, [api, apiState, keyringState, accountAddress, tokenContract, dispatch]);

  // Update current selected account address in store
  const setAccountAddress = useCallback((accountAddress) => {
    const accountPair =
      accountAddress &&
      keyringState === 'READY' &&
      keyring.getPair(accountAddress);

    dispatch({
      type: 'SET_ACCOUNT_ADDRESS',
      payload: { accountAddress, accountPair }
    });
  }, [dispatch, keyringState]);

  // Get Account metadata from blockchain
  const getAccountMetadata = useCallback(targetAddress => {
    console.log('useSubstrate / getAccountMetadata');
    return tokenContract.call('rpc', tokenContract.getMessage('accountMetadataOf').def.name, config.callParams.endowment, config.callParams.weight, targetAddress)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call accountMetadataOf');
        console.log(u8aToString(res.output.elems));

        const jsonString = u8aToString(res.output.elems);

        if (jsonString) {
          try {
            return JSON.parse(trim(jsonString));
          } catch (e) {
            return {};
          }
        } else {
          return {};
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Update Account metadata in blockchain
  const updateAccountMetadata = useCallback((targetAddress, metadata) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.setAccountMetadataOf(targetAddress, JSON.stringify(metadata))
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call setAccountMetadataOf');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  // Get Supply chain from blockchain
  const getSupplyChain = useCallback(() => {
    console.log('useSubstrate / getSupplyChain');
    return tokenContract.call('rpc', tokenContract.getMessage('supplyChain').def.name, config.callParams.endowment, config.callParams.weight)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call supplyChain');
        console.log(u8aToString(res.output.elems));

        const jsonString = u8aToString(res.output.elems);

        if (jsonString) {
          try {
            return JSON.parse(trim(jsonString));
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Update Supply chain in blockchain
  const updateSupplyChain = useCallback((chainData) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.setSupplyChain(JSON.stringify(chainData))
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call setSupplyChain');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  // Get Roles from blockchain
  const getRoles = useCallback(() => {
    console.log('useSubstrate / getRoles');
    return tokenContract.call('rpc', tokenContract.getMessage('roles').def.name, config.callParams.endowment, config.callParams.weight)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call roles');
        console.log(u8aToString(res.output.elems));

        const jsonString = u8aToString(res.output.elems);

        if (jsonString) {
          try {
            return JSON.parse(trim(jsonString));
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Update Roles in blockchain
  const updateRoles = useCallback((roles) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.setRoles(JSON.stringify(roles))
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call setRoles');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  // Get list of tokens
  const listAllTokens = useCallback(() => {
    console.log('useSubstrate / listAllTokens');
    return tokenContract.call('rpc', tokenContract.getMessage('listAllTokens').def.name, config.callParams.endowment, config.callParams.weight)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call listAllTokens');
        console.log(res.output.elems);

        if (res.output.elems && res.output.elems.length) {
          try {
            return res.output.elems.map(item => item.toString());
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Mint new token
  const mintToken = useCallback((id) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.mint(id)
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call mint');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  // Get Token owner
  const getTokenOwner = useCallback(targetToken => {
    console.log('useSubstrate / getTokenOwner');
    return tokenContract.call('rpc', tokenContract.getMessage('ownerOf').def.name, config.callParams.endowment, config.callParams.weight, targetToken)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call getTokenOwner');
        console.log(res.output);

        try {
          return res.output.toString();
        } catch (e) {
          console.log(e);
          return '';
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Get Token metadata
  const getTokenMetadata = useCallback(targetToken => {
    console.log('useSubstrate / getTokenMetadata');
    return tokenContract.call('rpc', tokenContract.getMessage('tokenMetadataOf').def.name, config.callParams.endowment, config.callParams.weight, targetToken)
      .send(accountAddress)
      .then(res => {
        console.log('=== SC: RPC call tokenMetadataOf');
        console.log(u8aToString(res.output.elems));

        const jsonString = u8aToString(res.output.elems);

        if (jsonString) {
          try {
            return JSON.parse(trim(jsonString));
          } catch (e) {
            return {};
          }
        } else {
          return {};
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }, [accountAddress, tokenContract]);

  // Update Token metadata in blockchain
  const updateTokenMetadata = useCallback((targetToken, metadata) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.setTokenMetadataOf(targetToken, JSON.stringify(metadata))
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call setTokenMetadataOf');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  // TransferToken
  const transferToken = useCallback((targetAddress, targetToken) => new Promise((resolve, reject) => {
    (async () => {
      let signer;

      if (accountPair.meta.source === 'polkadot-js') {
        const injector = await web3FromAddress(accountAddress);
        signer = injector.signer;
      }

      try {
        const unsubTx = await api.tx.contracts.call(
          config.TOKEN_CONTRACT_ADDRESS,
          config.callParams.endowment,
          config.callParams.weight,
          tokenContractAbi.messages.transfer(targetAddress, targetToken)
        )
          .signAndSend(signer ? accountAddress : accountPair, { signer }, result => {
            console.log('=== SC: Tx: call transfer');
            console.log(`=== SC: Tx: current status is ${result.status}`);

            if (result.status.isInBlock) {
              console.log(`=== SC: Tx: included at blockHash ${result.status.asInBlock}`);
              resolve(true);
            } else if (result.status.isFinalized) {
              console.log(`=== SC: Tx: finalized at blockHash ${result.status.asFinalized}`);
              unsubTx();
            }
          });
      } catch (e) {
        reject(e);
      }
    })();
  }), [api, accountPair, accountAddress, tokenContractAbi]);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  return {
    ...state,
    setAccountAddress,
    getAccountMetadata,
    updateAccountMetadata,
    getSupplyChain,
    updateSupplyChain,
    getRoles,
    updateRoles,
    listAllTokens,
    mintToken,
    getTokenMetadata,
    updateTokenMetadata,
    getTokenOwner,
    transferToken,
    dispatch
  };
};

export default useSubstrate;

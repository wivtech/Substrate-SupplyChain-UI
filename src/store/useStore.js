import { useContext, useCallback } from 'react';
import { StoreContext } from './StoreContext';

const useStore = () => {
  const [state, dispatch] = useContext(StoreContext);

  const setAccountMetadata = useCallback((accountMetadata) => {
    dispatch({
      type: 'SET_ACCOUNT_METADATA',
      payload: accountMetadata
    });
  }, [dispatch]);

  return {
    ...state,
    setAccountMetadata,
    dispatch
  };
};

export default useStore;

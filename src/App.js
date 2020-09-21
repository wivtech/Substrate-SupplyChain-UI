import React, { createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message, Header } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from 'substrate-lib';
import { StoreContextProvider } from 'store/index.js';
import { DeveloperConsole } from 'substrate-lib/components';

import AccountSelector from 'components/meta/AccountSelector';
import BlockNumber from 'components/meta/BlockNumber';
import Metadata from 'components/meta/Metadata';
import NodeInfo from 'components/meta/NodeInfo';

import AccountMetadata from 'components/AccountMetadata';
import SupplyChainEditor from 'components/SupplyChainEditor';
import RolesManager from 'components/RolesManager';
import TokenEditor from './components/TokenEditor';

import 'assets/styles/index.scss';

const loader = text =>
  <Dimmer active>
    <Loader size='small'>{text}</Loader>
  </Dimmer>;

const message = err =>
  <Grid centered columns={2} padded>
    <Grid.Column>
      <Message
        negative compact floating
        header='Error Connecting to Blockchain'
        content={`${err}`}
      />
    </Grid.Column>
  </Grid>;

function Main () {
  const { accountPair, setAccountAddress, apiState, keyringState, apiError, tokenContractState } = useSubstrate();

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState === 'ERROR') return message('Could not initialize keyring');
  else if (keyringState === 'NO_ACCOUNTS') return message('No accounts available to use, please install Polkadot js extension and create new account.');
  else if (keyringState !== 'READY') return loader('Loading accounts (please review any extension\'s authorization)');

  if (tokenContractState === 'ERROR') return message('Could not connect to smart contract!');
  else if (tokenContractState !== 'READY') return loader('Connecting to SmartContract');

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} selected={accountPair} />
      </Sticky>

      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row stretched>
            <Grid.Column>
              <AccountMetadata />
            </Grid.Column>
          </Grid.Row>

          <br />

          <Grid.Row stretched>
            <Grid.Column>
              <SupplyChainEditor /> <br /><br />

              <RolesManager />
            </Grid.Column>

            <Grid.Column>
              <TokenEditor />
            </Grid.Column>
          </Grid.Row>

          <br />

          <Grid.Row>
            <Grid.Column>
              <Header as="h3">Blockchain Information</Header>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function App () {
  return (
    <SubstrateContextProvider>
      <StoreContextProvider>
        <Main />
      </StoreContextProvider>
    </SubstrateContextProvider>
  );
}

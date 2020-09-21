import React, { useEffect, useCallback, useState } from 'react';
import {
  Header,
  Button,
  Input,
  Dimmer,
  Loader,
  Modal
} from 'semantic-ui-react';

import { useSubstrate } from 'substrate-lib';

import './style.scss';

const SupplyChainEditor = (props) => {
  const { accountAddress, getSupplyChain, updateSupplyChain, tokenContractState } = useSubstrate();
  const [supplyChainData, setSupplyChainData] = useState([]);
  const [isEdited, setEdited] = useState(false);
  const [isEditorLoading, setEditorLoading] = useState(false);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalData, setAddModalData] = useState({ name: '', writer: '' });

  // Get supply chain data on ready
  const getSupplyChainOnContractReady = useCallback(async () => {
    if (tokenContractState === 'READY') {
      console.log('SupplyChainEditor / Getting supplychain data');
      setEditorLoading(true);

      try {
        const supplyChainData = await getSupplyChain();
        setEdited(false);
        setSupplyChainData(supplyChainData);
      } catch (e) {
        console.log('Can not get supply chain data: ', e);
        setEdited(false);
        setSupplyChainData([]);
      }

      setEditorLoading(false);
    }
  }, [getSupplyChain, tokenContractState, setSupplyChainData]);

  useEffect(() => {
    getSupplyChainOnContractReady();
  }, [getSupplyChainOnContractReady]);

  const onOpenAddModal = () => {
    setAddModalData({
      name: '',
      writer: accountAddress
    });
    setAddModalOpen(true);
  };

  const onChangeAddModalData = (field) => (e, target) => {
    setAddModalData({
      ...addModalData,
      [field]: target.value
    });
  };

  const onAddNode = () => {
    setSupplyChainData([...supplyChainData, addModalData]);
    setEdited(true);
    setAddModalOpen(false);
  };

  const onSaveSupplyChain = async () => {
    if (!isEdited) {
      return;
    }

    setEditorLoading(true);

    try {
      await updateSupplyChain(supplyChainData);
      setEdited(false);
    } catch (e) {
      console.log('Can not update supply chain: ', e);
    }

    setEditorLoading(false);
  };

  const onRemoveNode = (id) => {
    setSupplyChainData(supplyChainData.splice(id, 1));
  };

  return (
    <>
      <Header as="h3">
        Supply Chain
      </Header>

      <div className="supply-chain-editor">
        <Dimmer active={isEditorLoading}>
          <Loader>Loading</Loader>
        </Dimmer>

        {supplyChainData.map((data, index) => (
          <div className="supply-chain-editor__node" key={index}>
            <span className="supply-chain-editor__node__name">{data.name || '*Node'}</span>
            <Button icon="remove" onClick={() => onRemoveNode(index)} size="tiny" />
            <span className="supply-chain-editor__node__arrow"><i className="fas fa-arrow-alt-circle-right"></i></span>
          </div>
        ))}
      </div>

      <div className="d-flex flex-row">
        <Button content="Add new node" style={{ marginRight: 'auto' }} onClick={onOpenAddModal} />
        <Button content="Save" disabled={!isEdited} onClick={onSaveSupplyChain} />
        <Button content="Reset" disabled={!isEdited} onClick={getSupplyChainOnContractReady} />
      </div>

      <Modal
        onClose={() => setAddModalOpen(false)}
        onOpen={() => setAddModalOpen(true)}
        open={isAddModalOpen}
        size="small"
      >
        <Modal.Header>Add New Node</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Input
              label="Name" placeholder="Please enter name" fluid value={addModalData.name}
              onChange={onChangeAddModalData('name')}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => setAddModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            content="Add"
            onClick={onAddNode}
            positive
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default SupplyChainEditor;

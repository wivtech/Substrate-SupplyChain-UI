import React, { useEffect, useCallback, useState } from 'react';
import {
  Header,
  Label,
  Button,
  Modal,
  Input, Segment
} from 'semantic-ui-react';

import { useSubstrate } from 'substrate-lib';
import { useStore } from 'store/index.js';

import './style.scss';

const AccountMetadata = (props) => {
  const { accountAddress, getAccountMetadata, updateAccountMetadata } = useSubstrate();
  const { accountMetadata, setAccountMetadata } = useStore();

  // Get metadata when address changes
  const getMetadataOnAccountSelect = useCallback(async () => {
    console.log('AccountMetadata / Getting metadata for: ', accountAddress);
    try {
      const metadata = await getAccountMetadata(accountAddress);
      setAccountMetadata(metadata);
    } catch (e) {
      console.log('Can not get metadata: ', e);
      setAccountMetadata(null);
    }
  }, [accountAddress, getAccountMetadata, setAccountMetadata]);

  useEffect(() => {
    getMetadataOnAccountSelect();
  }, [getMetadataOnAccountSelect]);

  // Edit profile modal
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditModalLoading, setEditModalLoading] = useState(false);
  const [editModalData, setEditModalData] = useState({ name: '', location: '', phone: '', email: '' });

  const onOpenEditModal = () => {
    setEditModalData({
      ...editModalData,
      ...accountMetadata
    });
    setEditModalOpen(true);
  };

  const onChangeEditModalData = (field) => (e, target) => {
    setEditModalData({
      ...editModalData,
      [field]: target.value
    });
  };

  const onSaveEditModalData = async () => {
    setEditModalLoading(true);

    try {
      await updateAccountMetadata(accountAddress, editModalData);
      await getMetadataOnAccountSelect();
      setEditModalLoading(false);
    } catch (e) {
      console.log('Can not update profile: ', e);
      setEditModalLoading(false);
      return;
    }

    setEditModalOpen(false);
  };

  return (
    <>
      <br />

      <Header as="h3">
        Profile <Button basic size="mini" style={{ marginLeft: '10px' }} onClick={onOpenEditModal}>Edit</Button>
      </Header>

      <Segment>
        <Label>Name <Label.Detail>{(accountMetadata && accountMetadata.name) || ''}</Label.Detail></Label>
        <Label>Role <Label.Detail>{(accountMetadata && accountMetadata.role) || ''}</Label.Detail></Label>
        <Label>Location <Label.Detail>{(accountMetadata && accountMetadata.location) || ''}</Label.Detail></Label>
        <Label>Blockchain Address <Label.Detail>{accountAddress}</Label.Detail></Label>
      </Segment>

      <Modal
        onClose={() => !isEditModalLoading && setEditModalOpen(false)}
        onOpen={() => setEditModalOpen(true)}
        open={isEditModalOpen}
        size="small"
      >
        <Modal.Header>Edit Profile</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Please enter profile details</p> <br />
          </Modal.Description>
          <Input
            label="Name" placeholder="Please enter name" fluid value={editModalData.name}
            onChange={onChangeEditModalData('name')}
          /> <br />
          <Input
            label="Location" placeholder="Please ente your physical location" fluid
            value={editModalData.location} onChange={onChangeEditModalData('location')}
          /> <br />
          <Input
            label="Phone" placeholder="Please ente your phone" fluid value={editModalData.phone}
            onChange={onChangeEditModalData('phone')}
          /> <br />
          <Input
            label="Email" placeholder="Please ente your email address" fluid value={editModalData.email}
            onChange={onChangeEditModalData('email')}
          /> <br />
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={isEditModalLoading}
            onClick={() => setEditModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            content="Update"
            onClick={onSaveEditModalData}
            positive
            loading={isEditModalLoading}
            disabled={isEditModalLoading}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default AccountMetadata;

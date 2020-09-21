import React, { useEffect, useState, useCallback } from 'react';
import {
  Header,
  Table,
  Button,
  Input,
  Modal,
  Segment
} from 'semantic-ui-react';

import { useSubstrate } from 'substrate-lib';

import './style.scss';

const RolesManager = (props) => {
  const { getRoles, updateRoles, getAccountMetadata, tokenContractState } = useSubstrate();
  const [rolesData, setRolesData] = useState([]);
  const [isRolesDataLoading, setRolesDataLoading] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ isEdit: false, address: '', name: '', role: '' });

  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedAddressRole, setSelectedAddressRole] = useState('');

  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [accountMetadata, setAccountMetadata] = useState(null);
  const [isAccountMetadataLoading, setAccountMetadataLoading] = useState(null);

  // Get role data on ready
  const getRolesOnContractReady = useCallback(async () => {
    if (tokenContractState === 'READY') {
      console.log('RolesManager / Getting roles data');
      setRolesDataLoading(true);

      try {
        const rolesData = await getRoles();
        setRolesData(rolesData);
      } catch (e) {
        console.log('Can not get roles data: ', e);
        setRolesData([]);
      }

      setRolesDataLoading(false);
    }
  }, [getRoles, tokenContractState, setRolesData]);

  useEffect(() => {
    getRolesOnContractReady();
  }, [getRolesOnContractReady]);

  // Get meta data of user when address is selected
  const getAddressDetailsOnSelect = useCallback(async () => {
    console.log('RolesManager / Getting metadata for: ', selectedAddress);
    setAccountMetadataLoading(true);

    try {
      const metadata = await getAccountMetadata(selectedAddress);
      setAccountMetadata(metadata);
    } catch (e) {
      console.log('Can not get metadata: ', e);
      setAccountMetadata(null);
    }

    setAccountMetadataLoading(false);
  }, [selectedAddress, setAccountMetadata, getAccountMetadata]);

  useEffect(() => {
    getAddressDetailsOnSelect();
  }, [getAddressDetailsOnSelect]);

  const onViewDetails = (index) => {
    setAddressSearchValue(rolesData[index].address);
    setSelectedAddress(rolesData[index].address);
    setSelectedAddressRole(rolesData[index].role);
  };

  const onOpenAddModal = () => {
    setModalData({
      isEdit: false,
      address: '',
      name: '',
      role: ''
    });
    setModalOpen(true);
  };

  const onOpenEditModal = () => {
    setModalData({
      isEdit: true,
      address: selectedAddress || '',
      name: (accountMetadata && accountMetadata.name) || '',
      role: selectedAddressRole || ''
    });
    setModalOpen(true);
  };

  const onModalFinish = async () => {
    setRolesDataLoading(true);

    const existingIndex = rolesData.findIndex(item => item.address === modalData.address);
    let newRolesData = [...rolesData];
    if (existingIndex >= 0) {
      newRolesData[existingIndex] = {
        address: modalData.address,
        name: modalData.name,
        role: modalData.role
      };
    } else {
      newRolesData = [...newRolesData, {
        address: modalData.address,
        name: modalData.name,
        role: modalData.role
      }];
    }

    setRolesData(newRolesData);

    setTimeout(async () => {
      try {
        await updateRoles(newRolesData);
        await getRolesOnContractReady();
        setRolesDataLoading(false);
      } catch (e) {
        console.log('Can not update roles: ', e);
        setRolesDataLoading(false);
        return;
      }

      setModalOpen(false);
    });
  };

  const onChangeModalData = (field) => (e, target) => {
    setModalData({
      ...modalData,
      [field]: target.value
    });
  };

  const onSearchAddress = () => {
    // Get selected address's metadata
    setSelectedAddress(addressSearchValue);

    // Get role of selected address
    const role = rolesData.find(item => item.address === addressSearchValue);
    if (role) {
      setSelectedAddressRole(role.role);
    }
  };

  return (
    <>
      <Header as="h3" className="roles-manager-title">
        Roles Manager
      </Header>

      <Segment className="roles-manager">
        <div className="row">
          <div className="col-md-12">
            <Button content="Add" onClick={onOpenAddModal} />

            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {!!(rolesData && rolesData.length) && rolesData.map((item, index) => (
                  <Table.Row key={`${item.address}-${item.name}`}>
                    <Table.Cell>{item.name || ''}</Table.Cell>
                    <Table.Cell>{item.role || ''}</Table.Cell>
                    <Table.Cell>
                      <Button circular icon="eye" size="tiny" onClick={() => onViewDetails(index)} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          <div className="col-md-12 d-flex flex-column justify-content-start">
            <Input
              placeholder="Search address"
              fluid action
              value={addressSearchValue}
              onChange={(e, t) => setAddressSearchValue(t.value)}
            >
              <input />
              <Button icon="search" onClick={onSearchAddress} />
            </Input>

            <br />
            <Button content="Edit" onClick={onOpenEditModal} disabled={!selectedAddress || isAccountMetadataLoading} className="m-l-auto" />

            <br />

            <span><b>Name: </b>{(accountMetadata && accountMetadata.name) || ''}</span><br /><br />
            <span><b>Role: </b>{selectedAddressRole}</span><br /><br />
            <span><b>Location: </b>{(accountMetadata && accountMetadata.location) || ''}</span><br /><br />
            <span><b>Phone: </b>{(accountMetadata && accountMetadata.phone) || ''}</span><br /><br />
            <span><b>Email: </b>{(accountMetadata && accountMetadata.email) || ''}</span><br /><br />
          </div>
        </div>
      </Segment>

      <Modal
        onClose={() => !setRolesDataLoading && setModalOpen(false)}
        onOpen={() => setModalOpen(true)}
        open={isModalOpen}
        size="small"
      >
        <Modal.Header>Edit Role</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Please enter profile details</p> <br />
            <Input
              label="Address" placeholder="Please enter address" fluid value={modalData.address}
              onChange={onChangeModalData('address')}
              disabled={modalData.isEdit}
            /> <br />
            <Input
              label="Name" placeholder="Please enter name" fluid value={modalData.name}
              onChange={onChangeModalData('name')}
            /> <br />
            <Input
              label="Role" placeholder="Please enter role" fluid value={modalData.role}
              onChange={onChangeModalData('role')}
            /> <br />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={isRolesDataLoading}
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            content="Update"
            onClick={onModalFinish}
            positive
            disabled={!modalData.role || !modalData.address}
            loading={isRolesDataLoading}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default RolesManager;

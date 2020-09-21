import React, { useEffect, useState, useCallback } from 'react';
import {
  Header,
  Button,
  Input,
  Modal,
  Segment,
  Table
} from 'semantic-ui-react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';

import { useSubstrate } from 'substrate-lib';

import './style.scss';

const TokenEditor = (props) => {
  const { listAllTokens, mintToken, getTokenMetadata, updateTokenMetadata, getTokenOwner, transferToken, tokenContractState } = useSubstrate();

  const [tokensList, setTokensList] = useState([]);
  const [isTokensListLoading, setTokensListLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(-1);

  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [isTokenMetadataLoading, setTokenMetadataLoading] = useState(false);
  const [tokenOwner, setTokenOwner] = useState('');
  const [mapPosition, setMapPosition] = useState([0, 0]);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState({
    remarks: '',
    requiredConditions: '',
    sensors: '',
    movements: '',
    photo: '',
    lat: 0,
    long: 0
  });
  const [isEditModalLoading, setEditModalLoading] = useState(false);

  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [transferModalData, setTransferModalData] = useState({ targetAddress: '' });
  const [isTransferModalLoading, setTransferModalLoading] = useState(false);

  // Get list of tokens on ready
  const getListOfTokensOnContractReady = useCallback(async () => {
    if (tokenContractState === 'READY') {
      console.log('TokenEditor / Getting list tokens');
      setTokensListLoading(true);

      try {
        const tokensList = await listAllTokens();
        setTokensList(tokensList);
      } catch (e) {
        console.log('Can not get list of tokens: ', e);
        setTokensList([]);
      }

      setTokensListLoading(false);
    }
  }, [listAllTokens, setTokensList, tokenContractState]);

  useEffect(() => {
    getListOfTokensOnContractReady();
  }, [getListOfTokensOnContractReady]);

  // Get metadata of token when user selects
  const getTokenMetadataOnSelect = useCallback(async () => {
    console.log('TokenEditor / Get metadata for: ', selectedToken);
    setTokenMetadataLoading(true);

    try {
      const metadata = await getTokenMetadata(selectedToken);
      setTokenMetadata(metadata);
      const owner = await getTokenOwner(selectedToken);
      setTokenOwner(owner);

      const lat = (metadata && metadata.lat) || 0;
      const long = (metadata && metadata.long) || 0;
      setMapPosition([lat, long]);
    } catch (e) {
      console.log('Can not get token metadata: ', e);
      setTokenMetadata(null);
    }

    setTokenMetadataLoading(false);
  }, [selectedToken, getTokenMetadata, setTokenMetadata, getTokenOwner]);

  useEffect(() => {
    getTokenMetadataOnSelect();
  }, [getTokenMetadataOnSelect]);

  const onAddNewToken = async () => {
    setTokensListLoading(true);

    try {
      await mintToken(tokensList.length + 2);
      await getListOfTokensOnContractReady();
    } catch (e) {
      console.log('Can not mint token: ', e);
    }

    setTokensListLoading(false);
  };

  const onViewDetails = (token) => {
    setSelectedToken(token);
  };

  const onOpenEditMetadataModal = () => {
    setEditModalData({
      remarks: '',
      requiredConditions: '',
      sensors: '',
      movements: '',
      photo: '',
      lat: 51.505,
      long: -0.09,
      ...tokenMetadata
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
      await updateTokenMetadata(selectedToken, editModalData);
      await getTokenMetadataOnSelect();
      setEditModalLoading(false);
    } catch (e) {
      console.log('Can not update token metadata: ', e);
      setEditModalLoading(false);
      return;
    }

    setEditModalOpen(false);
  };

  const onOpenTransferModal = () => {
    setTransferModalData({
      targetAddress: ''
    });

    setTransferModalOpen(true);
  };

  const onChangeTransferModalData = (field) => (e, target) => {
    setTransferModalData({
      ...transferModalData,
      [field]: target.value
    });
  };

  const onFinishTransferModal = async () => {
    setTransferModalLoading(true);

    try {
      await transferToken(transferModalData.targetAddress, selectedToken);
      setTransferModalLoading(false);
    } catch (e) {
      console.log('Can not transfer token: ', e);
      setTransferModalLoading(false);
      return;
    }

    setTransferModalOpen(false);
  };

  // ==================================================
  // File uploading logic
  const onUploadFinish = (error, result) => {
    if (error) {
      console.log('Upload error: ', error);
    }
    if (result.event === 'success') {
      console.log(result.info.secure_url);
      setEditModalData({
        photo: result.info.secure_url
      });
    }
  };

  const onUploadFile = () => {
    const myCropWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'soapbravowork',
        uploadPreset: 't3emetzy',
        folder: 'widgetUpload',
        cropping: true
      },
      onUploadFinish
    );

    myCropWidget.open();
  };

  return (
    <>
      <Header as="h3" className="token-editor-title">
        Token Editor
      </Header>

      <Segment className="token-editor">
        <div className="row">
          <div className="col-md-6 d-flex flex-column mb-4">
            <Button
              content="New" onClick={onAddNewToken} disabled={isTokensListLoading}
              loading={isTokensListLoading}
            />
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {!!(tokensList && tokensList.length) && tokensList.map(token => (
                  <Table.Row key={token}>
                    <Table.Cell>{token}</Table.Cell>
                    <Table.Cell>
                      <Button circular icon="eye" size="tiny" onClick={() => onViewDetails(token)} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          <div className="col-md-9 d-flex flex-column">
            <Button content="Edit" onClick={onOpenEditMetadataModal} disabled={selectedToken === -1 || isTokenMetadataLoading} />

            <br />

            <div className="token-editor__metadata mb-4">
              <span><b>Owner: </b><br />{tokenOwner}</span><br /><br />
              <span><b>Remarks: </b><br />{(tokenMetadata && tokenMetadata.remarks) || ''}</span><br /><br />
              <span><b>Required Conditions: </b><br />{(tokenMetadata && tokenMetadata.requiredConditions) || ''}</span><br /><br />
              <span><b>Movements: </b><br />{(tokenMetadata && tokenMetadata.movements) || ''}</span><br /><br />
            </div>

            <div className="token-editor__map mb-4">
              <Map center={mapPosition} zoom={13}>
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />
                <Marker position={mapPosition}>
                  <Popup>Position</Popup>
                </Marker>
              </Map>
            </div>
          </div>

          <div className="col-md-9 d-flex flex-column">
            <Button content="Transfer" onClick={onOpenTransferModal} disabled={selectedToken === -1 || isTokenMetadataLoading || isTransferModalLoading} />

            <br />

            <div className="token-editor__image mb-4">
              {(tokenMetadata && tokenMetadata.photo)
                ? (
                  <img className="token-editor__image__img" src={(tokenMetadata && tokenMetadata.photo) || ''} alt="Product" />
                )
                : (
                  <span>No image available</span>
                )
              }
            </div>

            <div className="token-editor__sensors">
              <br />
              <span><b>Sensors: </b><br />{(tokenMetadata && tokenMetadata.sensors) || ''}</span>
            </div>
          </div>
        </div>
      </Segment>

      {/* Edit Modal */}
      <Modal
        onClose={() => !isEditModalLoading && setEditModalOpen(false)}
        onOpen={() => setEditModalOpen(true)}
        open={isEditModalOpen}
        size="small"
      >
        <Modal.Header>Edit Token Metadata</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Please edit token meta data</p> <br />
          </Modal.Description>

          <Input
            label="Remarks" placeholder="Enter token remarks" fluid value={editModalData.remarks}
            onChange={onChangeEditModalData('remarks')}
          /> <br />
          <Input
            label="Required Conditions" placeholder="Enter required conditions to store" fluid
            value={editModalData.requiredConditions}
            onChange={onChangeEditModalData('requiredConditions')}
          /> <br />
          <Input
            label="Sensors" placeholder="Sensor Urls" fluid value={editModalData.sensors}
            onChange={onChangeEditModalData('sensors')}
          /> <br />
          <Input
            label="Movements" placeholder="Movements" fluid value={editModalData.movements}
            onChange={onChangeEditModalData('movements')}
          /> <br />
          <Input
            label="Photo url" placeholder="Photo" fluid value={editModalData.photo} readOnly
            action
          >
            <input />
            <Button icon="upload" onClick={onUploadFile} />
          </Input> <br />
          <Input
            label="Latitude" placeholder="0" fluid value={editModalData.lat} type="number"
            onChange={onChangeEditModalData('lat')}
          /> <br />
          <Input
            label="Longitude" placeholder="0" fluid value={editModalData.long} type="number"
            onChange={onChangeEditModalData('long')}
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

      {/* Transfer Modal */}
      <Modal
        onClose={() => !isTransferModalLoading && setTransferModalOpen(false)}
        onOpen={() => setTransferModalOpen(true)}
        open={isTransferModalOpen}
        size="small"
      >
        <Modal.Header>Transfer Token</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Please enter destination address</p> <br />
          </Modal.Description>
          <Input
            label="Target Address" placeholder="Please enter address" fluid value={transferModalData.targetAddress}
            onChange={onChangeTransferModalData('targetAddress')}
          /> <br />
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={isTransferModalLoading}
            onClick={() => setTransferModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            content="Transfer"
            onClick={onFinishTransferModal}
            positive
            loading={isTransferModalLoading}
            disabled={isTransferModalLoading}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default TokenEditor;

# Wiv token React frontend

First make sure backend node is running and token contract is deployed.

You can build contract on your own or use already built files in `/src/contract-abi`.

You can deploy contract using [Polkadot Apps](https://polkadot.js.org/apps/).
Please check node repository for more details.

## Running project

### Run project in development mode

1. Install `node`, `yarn`.
2. Clone repository and install dependencies with `yarn install`.
3. Update token contract address configuration at `/src/config/common.json`, update `TOKEN_CONTRACT_ADDRESS` with the address of token contract deployed.
4. Change blockchain node websocket server url in `development.json`, update `PROVIDER_SOCKET` value.
5. Start project by `yarn start`.

### Build project in production mode

1. Install `node`, `yarn`.
2. Clone repository and install dependencies with `yarn install`.
3. Update token contract address configuration at `/src/config/common.json`, update `TOKEN_CONTRACT_ADDRESS` with the address of token contract deployed.
4. Change blockchain node websocket server url in `production.json`, update `PROVIDER_SOCKET` value to production server's websocket url.
5. Build project by `yarn build`.
6. Deploy result static files to frontend server.

## Interacting with UI

### Login with Polkadot chrome extension
You should install polkadot js extension, which is similar to metamask ethereum extension.

[Install in Chrome webstore](https://chrome.google.com/webstore/detail/mopnmbcafieddcagagdcbnhejhlodfdd)

Once you open the application, you will be asked to authorize app in polkadot extension, just allow it.

Main UI:
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202710/Wiv%20Wiki/2_Main_UI_oequvq.png" alt="Main UI">

### Update user profile

Top section of the UI is profile view, you can click edit button to update your profile.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202708/Wiv%20Wiki/3_Edit_Profile_otryqh.png" alt="Edit profile">

### Edit supply chain nodes

This is supply chain node editor.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202708/Wiv%20Wiki/4_Supply_chain_editor_p2qbva.png" alt="Supply chain editor">

Add new nodes by clicking `Add new node` button.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202708/Wiv%20Wiki/5_Supply_chain_add_new_node_ads5t6.png" alt="Add new node">

Once you finished editing node, click `Save` button to save status to blockchain.

### Generate Token, Update Token

This is Main token editor view.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202709/Wiv%20Wiki/8_Token_editor_gazdmh.png" alt="Token editor">

You can click `Add` button to mint new token.

Once token is minted, you can see it added to the table.
Click view icon to see details of the token.

Once token is selected, you can click `Edit` button to update token metadata.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202709/Wiv%20Wiki/9_Token_editor_edit_token_mniogf.png" alt="Token metadata editor">

You can transfer to other user by clicking `Transfer` button.

### Edit user roles

This is user roles manager.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202708/Wiv%20Wiki/6_Roles_manager_xjbzuj.png" alt="User roles manager">

You can add new role by clicking `Add`, or edit selected role by clicking `Edit` button.
<img src="https://res.cloudinary.com/soapbravowork/image/upload/v1602202708/Wiv%20Wiki/7_Roles_manager_edit_role_eoanjs.png" alt="Edit role">

You can find user's information by entering address to top search bar and click search icon
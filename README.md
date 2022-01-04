Author: Amir Golan

# Smart-Contract Backed Crowdfunding Application

## Crowdfunding Campaigns Overview

Crowdfunding is a form of financing via the internet, in which providers advertise a certain business idea or project in order to obtain capital. The required amount isn’t provided by specialized investors or banks, but by a myriad of different investors. The respective sum for financing is achieved through a high number of comparatively low amounts. A “crowdfunding platform” acts as an intermediary between those seeking capital and their investors.
To contribute, each contributer donates money to a selected crowdfunding campaign. If the goal of the campaign is reached within a predefined time period, the campaign is deamed successful.
If the campaign succeeds, the owner can withdraw the money and use it for the described purpose.
If the campaign fails to reach it's goal, the money is refunded to the contributers.

## Smart Contracts for Crowdfunding Campaigns

To remove the unnecessary third party, this project implements a Crowdfunding campaign smart contract that can be deployed on an Etherium blockchain. Each campaign is started by publishing a smart contract which manages the operations including depositing funds, withdrawing funds, and requesting refunds in a distributed manner.

## Quick Start

To quickly run all components locally on your machine, run:

- git clone https://amir.golan01@vcs.ap.idc.ac.il/blockchain/project/crowdfunding-amirgolan

- cd crowdfunding-amirgolan

- docker-compose up

- access the client at http://localhost:8000 using your browser.

## Project Architecture

The project contains 3 main components:

### Crowdfunding Client

The client runs on each users computer and allows you to safely use your private keys without exposing them to anyone. The client interacts with the blockchain, to create new funds, send donations and request withdrawals or refunds from expired crowdfunds.
The client also interacts with the server to get information about existing campaigns that are not available on the blockchain. This information includes a list of all campaigns and the name and description of each campaign. In case the server is not available the client can still perform all operations except listing campaigns and getting their name and description. To use the client without access to the server use the "unregistered campaign" operations.

### Crowdfunding Server

The crowdfunding server stores information about existing campaigns. It's role is to allow the different users to share information about their campaigns. Only one instance of the server should be run and the address of the server needs to be provided to all clients so that they use the same server. The server does not perform any operations on the blockchain that requires signing transactions and should never hold any private keys. The server needs to have access to a postgreSQL database that it uses to store the campaign information.

### Crowdfunding Server Database

The server needs to have access to a postgreSQL database in order to store campaigns information. In order to have access to your postgreSQL database, set the following environment variables in the _/docker-compose.yaml_ fileA:

- DB_NAME

- DB_USER

- DB_PASSWORD

- DB_HOST

- DB_PORT

After configuring the correct database the project will be full ready to run.

## Crowdfunding Client - Details

### Accessing the client

The client can be accessed in GUI or API form. The GUI is available at http://localhost:8000 once the docker container is run and the API openAPI (swagger) can be found at http://localhost:8000/api

### Wallet

When the client is run on your computer, it will run a wallet that manages your accounts locally. The wallet allows you to create private and public key pairs, sign transactions and store the private keys safely.
All private keys are encrypted using a password that you choose and cannot be accessed by anyone who doesn't have your password. The private keys never leave your computer and are only used locally.

Wallet operations available:

- Create new key pair

- Upload and save existing keys

- Lock account (will use your password to encrypt the private key)

- Unlock account

- Get account balance

- Get private key - account must be unlocked

To use any account for crowdfunding operations, the account must be known to the wallet and in unlocked state.

### Crowdfunding Operations

The client allows to perform the following operations on crowdfunding campaigns:

- Create a new campaign

- Donate to an existing campaign

- Request Refund

- Withdraw funds

All operations require an account to be loaded in the wallet and unlocked. Withdrawing funds and requesting a refund is only possible after the campaign is over (the time is expired) and donating is only available if the campaign hasn't expired.
To withdraw funds, two out of three of the campaign owners need to sign the transaction. To allow this to be done easily, the client allows any user to sign a transaction which authorizes the withdrawal of funds from a campaign to a specific account. Then this signature, which doesn't need to be stored secretly, can be sent to a second owner who uses the signed message to create the final transaction which withdraws the funds to the chosen target account. If the target account in the signed message doesn't match the target account in the transaction the withdrawal will fail. If the signed message and the transaction sender are not both owners of the campaign(different owners) then the withdrawal will fail. In case you have access to the private keys of two owners of the campaigns the client allows to simply create the transaction and send it to the blockchain without first creating a signed message.

## Addiotional Configurations

All enviornment variables are specified in the _/docker-compose.yaml_ file, and can be changed. Some of these variables were mentioned above. Additional enviornment variables include ETH_HOST to configure the host that will be used to register transactions on the blockchain, WALLET_DB which determine the file path to store the encrypted private keys on the client machine and more.

# ula-vc-data-management

[![Build Status](https://travis-ci.org/rabobank-blockchain/ula-vc-data-management.svg?branch=master)](https://travis-ci.org/rabobank-blockchain/ula-vc-data-management)
[![Test Coverage](https://api.codeclimate.com/v1/badges/77b550131627862ec4e2/test_coverage)](https://codeclimate.com/github/rabobank-blockchain/ula-vc-data-management/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/77b550131627862ec4e2/maintainability)](https://codeclimate.com/github/rabobank-blockchain/ula-vc-data-management/maintainability)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A [ULA](https://github.com/rabobank-blockchain/universal-ledger-agent) Holder plugin, responsible for storing and retrieving Verifiable Credentials and address data from a self defined data source.
This plugin also translates Verifiable Credentials to the [shared data model](https://github.com/rabobank-blockchain/universal-ledger-agent/blob/master/docs/designs/datamodel-ssi.png).

## Installation

In an existing project (with `package.json`), install `ula-vc-data-management`

```bash
npm install ula-vc-data-management --save
```

## Usage

The following `data-storage` interface must be implemented to store the data on the medium of your choice:

```typescript
interface DataStorage {
  get (key: string): Promise<any>
  set (key: string, value: any): Promise<void>
  remove (key: string): Promise<void>
}
```
 
Currently the `vcDataManagement` plugin accepts the following message types:

- `save-vcs`: Store Verified Credentials
- `get-vcs-by-context`: Retrieve Verified Credentials based on a regular expression matching the context field
- `get-vcs-by-subject`: Retrieve Verified Credentials based on a regular expression matching the CredentialSubject key
- `save-address`: Store an address and its details (accountId, keyId, predicate)
- `save-vc-transaction`: Save a [VC transaction](src/model/vc-transaction.ts) object
- `get-address-details`: Get the address details (accountId, keyId, predicate)
- `get-attestations`: Get all attestations (conform the shared data model)
- `get-attestors`: Get all attestors (conform the shared data model)
- `get-transactions`: Get all transaction (conform the shared data model)
- `get-new-key-id`: Receive a unique unused keyId (to create a unique address)
- `data-clear-all`: Clear all Verifiable Credentials

```typescript
import { 
  AddressRepository, 
  VcDataManagement, 
  VerifiableCredentialRepository 
} from 'ula-vc-data-management'
import { 
  EventHandler, 
  Message 
} from 'universal-ledger-agent'

// Assume an implementation of DataStorage at 'my-data-storage'
import { MyDataStorage } from 'my-data-storage'
const myDataStorage = new MyDataStorage()

// Create instances for the address - and VC repositories
const addressRepo = new AddressRepository(myDataStorage)
const vcRepo = new VerifiableCredentialRepository(myDataStorage)

// Create the vcDataManagement instance
let vcDataManagement = new VcDataManagement(vcRepo, addressRepo)

// Create an array of plugins, now it's only vcDataManagement
const plugins = [ vcDataManagement ]

// Initialize the ULA with the plugins
const eventHandler = new EventHandler(plugins)

// Example: Store an address
const testAddress = {
  address: '0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4',
  accountId: 101,
  keyId: 532,
  predicate: 'https://schema.org/givenName'
}

// define the ULA message, to save address details
const message = new Message({
  type: 'save-address',
  address: testAddress
})
 
// Offer the message to the ULA. For this message implementation,
// no callback is used in this case so the parameter undefined
eventHandler.processMessage(message, undefined)
```

## Running tests

Besides unit testing with Mocha, the effectivity of all tests are also measured with the Stryker mutation testing framework.

```bash
npm run test
npm run stryker
```

We aim to achieve a coverage of 100%. Stryker and/or mocha test scores below 80% will fail the build.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License and disclaimer

[apache-2.0](https://choosealicense.com/licenses/apache-2.0/) with a [notice](NOTICE).

We discourage the use of this work in production environments as it is in active development and not mature enough.

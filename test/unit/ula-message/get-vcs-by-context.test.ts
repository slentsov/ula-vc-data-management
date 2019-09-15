/*
 * Copyright 2019 Coöperatieve Rabobank U.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'
import {
  AddressRepository,
  VcDataManagement,
  VerifiableCredentialRepository,
  VerifiableCredentialTransactionRepository
} from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'
import { EventHandler, Message } from 'universal-ledger-agent'
import { CredentialStatus, IProof, IVerifiableCredential, VerifiableCredential } from 'vp-toolkit-models'

const testProofParams: IProof = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  nonce: '71512644-2f4f-4bb9-9c9d-9f5e1fc9a1d2'
}

const testCredParams = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date('01-01-2019 12:00:00'),
  credentialSubject: {
    id: 'did:protocol:holderaddress',
    givenName: 'John'
  },
  issuerName: 'Company',
  issuerIcon: 'https://company.com/logo.png',
  proof: testProofParams,
  credentialStatus: new CredentialStatus({
    id: '0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440',
    type: 'vcStatusRegistry2019'
  }),
  '@context': ['https://schema.org/givenName']
} as IVerifiableCredential

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

// Get verifiable credentials by context field using regex
describe('get-vcs-by-context ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return the correct VC', (done) => {
    const repositoryResult = [new VerifiableCredential(testCredParams)]
    const vcRepoStub = sinon.stub(vcRepo, 'findByContext').resolves(repositoryResult)
    const regex = /schema\.org\/givenname/i
    const ulaTestMessage = new Message({
      type: 'get-vcs-by-context',
      contextRegex: regex
    })
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    const handleMessageResult = sut.handleEvent(ulaTestMessage,
      async (data: VerifiableCredential[]) => {
        // Assert after the data has returned
        data.should.have.been.equal(repositoryResult)
        vcRepoStub.should.have.been.calledOnceWithExactly(regex)
        await handleMessageResult.should.eventually.equal('success')
        done()
      })
  })
})

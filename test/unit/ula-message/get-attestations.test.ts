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
import { Attestation, EventHandler, Message, UlaResponse } from 'universal-ledger-agent'
import { CredentialStatus, IProof, IVerifiableCredential, VerifiableCredential } from 'vp-toolkit-models'

const testProof: IProof = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  nonce: '71512644-2f4f-4bb9-9c9d-9f5e1fc9a1d2'
}

const testCred = {
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
  proof: testProof,
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

describe('get-attestations ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return attestation w3 credential context if the context field is empty', (done) => {
    const testCredWithoutProofContext = Object.assign({}, testCred)
    testCredWithoutProofContext['@context'] = undefined
    const repositoryResult = [new VerifiableCredential(testCredWithoutProofContext)]
    sinon.stub(vcRepo, 'findAll').resolves(repositoryResult)
    const ulaTestMessage = new Message({ type: 'get-attestations' })
    let ulaResponse: UlaResponse | undefined
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    sut.handleEvent(
      ulaTestMessage,
      (response: UlaResponse) => {
        ulaResponse = response
      })
      .then((result) => {

        // @ts-ignore
        ulaResponse.body[0].context.should.be.deep.equal(['https://www.w3.org/2018/credentials/v1'])
        result.should.be.equal('success')
        done()
      })
  })

  it('should return verifiable credentials as attestations', (done) => {
    const repositoryResult = [new VerifiableCredential(testCred)]
    const vcRepoStub = sinon.stub(vcRepo, 'findAll').resolves(repositoryResult)
    const ulaTestMessage = new Message({ type: 'get-attestations' })
    let ulaResponse: UlaResponse | undefined
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    sut.handleEvent(
      ulaTestMessage,
      (response: UlaResponse) => {
        ulaResponse = response
      })
      .then((result) => {
        const expectedData = [
          new Attestation({
            uuid: testProof.nonce,
            attestorPubKey: testProof.verificationMethod,
            forPubKey: testCred.credentialSubject.id,
            context: testCred['@context'] as string[],
            type: [testProof.type],
            datetime: testCred.issuanceDate,
            statements: { givenName: 'John' }
          })
        ]

        // @ts-ignore
        ulaResponse.body.should.be.deep.equal(expectedData)
        vcRepoStub.callCount.should.be.equal(1)
        result.should.be.equal('success')
        done()
      })
  })
})

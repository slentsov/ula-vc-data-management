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
import { Attestation, Attestor, EventHandler, IAttestor, Message, UlaResponse } from 'universal-ledger-agent'
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

describe('get-attestors ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return issuers as attestors', (done) => {
    const firstCredential = new VerifiableCredential(testCredParams)
    const secondCredentialParams = Object.assign({}, testCredParams)
    secondCredentialParams.issuer = 'secondIssuer'
    secondCredentialParams.proof = Object.assign({}, testProofParams)
    secondCredentialParams.proof.verificationMethod = 'secondIssuerPubKey'
    const secondCredential = new VerifiableCredential(secondCredentialParams)
    // Result from repository are two duplicates, to ensure only unique entries are returned
    const vcFindAllRepoStub = sinon.stub(vcRepo, 'findAll').resolves([firstCredential, firstCredential, secondCredential])
    const vcFindIssuerRepoStub = sinon.stub(vcRepo, 'findByIssuer').resolves([firstCredential])
    const ulaTestMessage = new Message({ type: 'get-attestors' })
    let ulaResponse: UlaResponse | undefined

    initializeSut()
    sut.handleEvent(
      ulaTestMessage,
      (response: UlaResponse) => {
        ulaResponse = response
      })
      .then((result) => {
        const firstExpectedAttestorParams: IAttestor = {
          name: firstCredential.additionalFields['issuerName'],
          pubKey: testProofParams.verificationMethod,
          datetime: testCredParams.issuanceDate.toISOString(),
          icon: firstCredential.additionalFields['issuerIcon'],
          transactions: [],
          receivedAttestations: [],
          issuedAttestations: [new Attestation({
            uuid: testProofParams.nonce,
            attestorPubKey: testProofParams.verificationMethod,
            forPubKey: testCredParams.credentialSubject.id,
            context: testCredParams['@context'] as string[],
            type: [testProofParams.type],
            datetime: testCredParams.issuanceDate.toISOString(),
            statements: { givenName: 'John' }
          })]
        }
        const secondExpectedAttestor = Object.assign({}, firstExpectedAttestorParams)
        secondExpectedAttestor.pubKey = 'secondIssuerPubKey'
        const expectedData = [
          new Attestor(firstExpectedAttestorParams),
          new Attestor(secondExpectedAttestor)
        ]

        // @ts-ignore
        ulaResponse.body.should.be.deep.equal(expectedData)
        vcFindAllRepoStub.callCount.should.be.equal(1)
        vcFindIssuerRepoStub.should.have.been.calledWithExactly(testCredParams.issuer)
        result.should.be.equal('success')
        done()
      })
  })

  it('should return issuers without a name / icon as "Unknown"', (done) => {
    const credParams = Object.assign({}, testCredParams) as any
    delete credParams.issuerName
    delete credParams.issuerIcon
    const credential = new VerifiableCredential(credParams)
    sinon.stub(vcRepo, 'findAll').resolves([credential])
    sinon.stub(vcRepo, 'findByIssuer').resolves([credential])
    const ulaTestMessage = new Message({ type: 'get-attestors' })
    let ulaResponse: UlaResponse | undefined

    initializeSut()
    sut.handleEvent(
      ulaTestMessage,
      (response: UlaResponse) => {
        ulaResponse = response
      })
      .then(() => {
        // @ts-ignore
        ulaResponse.body[0].name.should.be.equal('Unknown')
        // @ts-ignore
        ulaResponse.body[0].icon.should.be.equal('Unknown')
        done()
      })
  })

  function initializeSut () {
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)
  }
})

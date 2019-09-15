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
  IVcTransaction,
  VcDataManagement,
  VcTransaction,
  VerifiableCredentialRepository,
  VerifiableCredentialTransactionRepository
} from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'
import { Attestation, EventHandler, Message, Transaction, UlaResponse } from 'universal-ledger-agent'
import { CredentialStatus, IProof, IVerifiableCredential, VerifiableCredential } from 'vp-toolkit-models'

const testProof: IProof = {
  type: 'Secp256k1Signature2019',
  created: new Date(Date.UTC(2019, 1, 1, 12, 34, 0)),
  verificationMethod: 'pubkey',
  nonce: '71512644-2f4f-4bb9-9c9d-9f5e1fc9a1d2'
}

const testCred = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date(Date.UTC(2019, 1, 1, 12, 0, 0)),
  credentialSubject: {
    id: 'did:protocol:holderaddress',
    'https://schema.org/givenName': 'John'
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

const fullTransaction: IVcTransaction = {
  created: new Date(Date.UTC(2019, 6, 1, 11, 22, 33)),
  uuid: 'bd87b8db-0e15-4301-b667-9a2b24ba9ab4',
  counterpartyId: testProof.verificationMethod,
  state: 'error',
  error: 'verificationRequirementsNotMet',
  issuedVcs: ['f3df5608-156c-459f-8bfc-ed35a3d33452'],
  revokedVcs: [new VerifiableCredential(testCred)],
  verifiedVcs: ['74e8da7d-06b3-4549-923d-9afc4eab2713', 'eb033f44-2518-44b4-8afa-fb21b7a9edd4']
}

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('get-transactions ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return VC transactions as regular transactions', (done) => {
    const vcTxRepoResult = [new VcTransaction(fullTransaction)]
    const vcTxRepoStub = sinon.stub(vcTxRepo, 'findAll').resolves(vcTxRepoResult)
    const vcRepoResult = new VerifiableCredential(testCred)
    const vcRepoStub = sinon.stub(vcRepo, 'findOneByNonce').resolves(vcRepoResult)
    const ulaTestMessage = new Message({ type: 'get-transactions' })
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
          new Transaction({
            uuid: vcTxRepoResult[0].uuid,
            attestorPubKey: vcTxRepoResult[0].counterpartyId,
            datetime: vcTxRepoResult[0].created,
            attest: [vcToAttestation(vcRepoResult)],
            verifyRequest: [vcToAttestation(vcRepoResult), vcToAttestation(vcRepoResult)],
            revoke: [vcToAttestation(vcTxRepoResult[0].revokedVcs[0])] // There is only one revoke
          })
        ]

        // @ts-ignore
        ulaResponse.body.should.be.deep.equal(expectedData)
        vcTxRepoStub.callCount.should.be.equal(1)
        vcRepoStub.callCount.should.be.equal(3)
        vcRepoStub.firstCall.should.have.been.calledWith(vcTxRepoResult[0].issuedVcs[0])
        vcRepoStub.secondCall.should.have.been.calledWith(vcTxRepoResult[0].verifiedVcs[0])
        vcRepoStub.thirdCall.should.have.been.calledWith(vcTxRepoResult[0].verifiedVcs[1])
        result.should.be.equal('success')
        done()
      })
  })

  function vcToAttestation (vc: VerifiableCredential): Attestation {
    return new Attestation({
      uuid: vc.proof.nonce,
      attestorPubKey: vc.proof.verificationMethod,
      forPubKey: vc.credentialSubject.id,
      context: vc.context as string[],
      type: [vc.proof.type],
      datetime: vc.issuanceDate,
      statements: credentialSubjectToStatement(vc.credentialSubject)
    })
  }

  function credentialSubjectToStatement (credentialSubject: any): any {
    const statements: any = {}
    for (const csKey of Object.keys(credentialSubject)) {
      const splittedKey = csKey.split('/')
      const keyWithoutUrl = splittedKey[splittedKey.length - 1]
      statements[keyWithoutUrl] = credentialSubject[csKey]
    }
    delete statements.id

    return statements
  }
})

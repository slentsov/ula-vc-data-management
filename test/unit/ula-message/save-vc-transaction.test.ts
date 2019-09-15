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
import { EventHandler, Message } from 'universal-ledger-agent'
import { VerifiableCredential } from 'vp-toolkit-models'

const fullTransaction: IVcTransaction = {
  created: new Date(Date.UTC(2019, 6, 1, 11, 22, 33)),
  uuid: 'bd87b8db-0e15-4301-b667-9a2b24ba9ab4',
  counterpartyId: '0x0e756E4ee839817571CcAD9439Fa151df340b565',
  state: 'error',
  error: 'verificationRequirementsNotMet',
  issuedVcs: ['f3df5608-156c-459f-8bfc-ed35a3d33452'],
  revokedVcs: [{} as VerifiableCredential], // Dummy value
  verifiedVcs: ['74e8da7d-06b3-4549-923d-9afc4eab2713', 'eb033f44-2518-44b4-8afa-fb21b7a9edd4']
}

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('save-vc ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should save a new Transaction properly', () => {
    const vcTxRepoStub = sinon.stub(vcTxRepo, 'saveOne')
    const ulaTestMessage = new Message({
      type: 'save-vc-transaction',
      transaction: fullTransaction
    })
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    const handleMessageResult = sut.handleEvent(ulaTestMessage, undefined)

    vcTxRepoStub.should.have.been.calledOnceWithExactly(new VcTransaction(fullTransaction))
    return handleMessageResult.should.eventually.equal('success')
  })
})

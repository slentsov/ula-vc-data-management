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
  Address,
  AddressRepository,
  IAddress,
  VcDataManagement,
  VerifiableCredentialRepository,
  VerifiableCredentialTransactionRepository
} from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'
import { EventHandler, Message } from 'universal-ledger-agent'

const testAddr: IAddress = {
  address: '0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4',
  accountId: 101,
  keyId: 532,
  predicate: 'givenName'
}

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('get-address-details ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return the correct Address object', (done) => {
    const repositoryResult = new Address(testAddr)
    const addressRepoStub = sinon.stub(addressRepo, 'findOneByPubAddress').resolves(repositoryResult)
    const ulaTestMessage = new Message({
      type: 'get-address-details',
      publicAddress: testAddr.address
    })
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    const handleMessageResult = sut.handleEvent(ulaTestMessage,
      async (data: Address) => {
        // Assert after the data has returned
        data.should.have.been.equal(repositoryResult)
        addressRepoStub.should.have.been.calledOnceWithExactly(testAddr.address)
        await handleMessageResult.should.eventually.equal('success')
        done()
      })
  })
})

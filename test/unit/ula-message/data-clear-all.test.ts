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

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('data-clear-all ULA message', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  const sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should clear all data', async () => {
    const vcRepoClearAllDataStub = sinon.stub(vcRepo, 'clearAll')
    const addressRepoClearAllDataStub = sinon.stub(addressRepo, 'clearAll')
    const ulaTestMessage = new Message({
      type: 'data-clear-all'
    })
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    const handleMessageResult = await sut.handleEvent(ulaTestMessage, undefined)

    handleMessageResult.should.be.equal('success')
    vcRepoClearAllDataStub.callCount.should.have.been.equal(1)
    addressRepoClearAllDataStub.callCount.should.have.been.equal(1)
  })
})

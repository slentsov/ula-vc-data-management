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
} from '../../src'
import { DataStorageMock } from '../mock/data-storage-mock'
import { EventHandler, Message } from 'universal-ledger-agent'

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('VC data management plugin', function () {
  const dataStorageMock = new DataStorageMock()
  const addressRepo = new AddressRepository(dataStorageMock)
  const vcRepo = new VerifiableCredentialRepository(dataStorageMock)
  const vcTxRepo = new VerifiableCredentialTransactionRepository(dataStorageMock)
  let sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)

  afterEach(() => {
    sinon.restore()
  })

  it('should return a hardcoded name', () => {
    sut.name.should.equal('VerifiableCredentialDataManagement')
  })

  it('should initialize with a valid eventhandler object', () => {
    const eventHandler = new EventHandler([])
    const initAction = () => {
      sut.initialize(eventHandler)
    }

    initAction.should.not.throw()
  })

  it('should return ignored for get-random-thing', () => {
    const ulaTestMessage = new Message({ type: 'get-random-thing' })
    const eventHandler = new EventHandler([])
    sut.initialize(eventHandler)

    const handleMessageResult = sut.handleEvent(ulaTestMessage, undefined)

    return handleMessageResult.should.eventually.equal('ignored')
  })

  it('should throw when the plugin was not initialized save-vcs message', () => {
    return testInitializationForMessageType('save-vcs')
  })

  it('should throw when the plugin was not initialized get-vcs-by-context message', () => {
    return testInitializationForMessageType('get-vcs-by-context')
  })

  it('should throw when the plugin was not initialized get-vcs-by-subject message', () => {
    return testInitializationForMessageType('get-vcs-by-subject')
  })

  it('should throw when the plugin was not initialized get-attestations message', () => {
    return testInitializationForMessageType('get-attestations')
  })

  it('should throw when the plugin was not initialized save-address message', () => {
    return testInitializationForMessageType('save-address')
  })

  it('should throw when the plugin was not initialized save-vc-transaction message', () => {
    return testInitializationForMessageType('save-vc-transaction')
  })

  it('should throw when the plugin was not initialized get-address-details message', () => {
    return testInitializationForMessageType('get-address-details')
  })

  it('should throw when the plugin was not initialized get-new-key-id message', () => {
    return testInitializationForMessageType('get-new-key-id')
  })

  it('should throw when the plugin was not initialized get-attestors message', () => {
    return testInitializationForMessageType('get-attestors')
  })

  it('should throw when the plugin was not initialized get-transactions message', () => {
    return testInitializationForMessageType('get-transactions')
  })

  it('should throw when the plugin was not initialized data-clear-all', () => {
    return testInitializationForMessageType('data-clear-all')
  })

  function testInitializationForMessageType (type: string) {
    const ulaMessage = new Message({ type: type })
    sut = new VcDataManagement(vcRepo, addressRepo, vcTxRepo)
    const handleEvent = sut.handleEvent(ulaMessage, undefined)
    return handleEvent.should.eventually.be.rejectedWith('Plugin not initialized. Did you forget to call initialize() ?')
  }
})

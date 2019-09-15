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
import { Address, AddressRepository, IAddress } from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'

const testAddr: IAddress = {
  address: '0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4',
  accountId: 101,
  keyId: 532,
  predicate: 'givenName'
}

const secondTestAddr: IAddress = {
  address: '0xff397D419060f38577342982E31541327d7616C9',
  accountId: 4,
  keyId: 12,
  predicate: 'familyName'
}

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('Address repository', function () {
  const dataStorage = new DataStorageMock()
  const repoDataKey = 'address'
  const sut = new AddressRepository(dataStorage)

  afterEach(() => {
    sinon.restore()
  })

  it('should return the correct array for findAll', () => {
    // Arranging and fake data to be returned from stub
    const firstAddress = new Address(testAddr)
    const secondAddress = new Address(secondTestAddr)
    const dataResult = [firstAddress, secondAddress]
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onFirstCall().resolves([testAddr.address, secondTestAddr.address])
      .onSecondCall().resolves(dataResult[0].toJSON())
      .onThirdCall().resolves(dataResult[1].toJSON())

    // Act
    return sut.findAll().then((value) => {
      // Assert
      return value.should.deep.equal(dataResult)
        && dataStubGet.getCalls().length.should.be.equal(3)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(repoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(testAddr.address)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(secondTestAddr.address)
    })
  })

  it('should return an empty array for findAll when storage is not initialized', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // Undefined storage

    return sut.findAll().then((value) => {
      return value.should.deep.equal([])
        && dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
    })
  })

  it('should throw when trying to find address details for one non-existing public address', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // Unknown item
    const addr = '0x0B44611B8AE632bE05f24ffe64651F050402aE01'

    const findAction = sut.findOneByPubAddress(addr)

    dataStubGet.should.have.been.calledOnceWithExactly(addr)
    return findAction.should.have.been.rejectedWith('No address details found')
  })

  it('should overwrite one address properly', () => {
    const address = new Address(testAddr)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([address.address])

    return sut.saveOne(address).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
        && dataStubSet.should.have.been.calledOnceWithExactly(testAddr.address, address.toJSON())
    })
  })

  it('should save one address properly', () => {
    const address = new Address(testAddr)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([])

    return sut.saveOne(address).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
        && dataStubSet.getCalls().length.should.be.equal(2)
        && dataStubSet.getCalls()[0].should.have.been.calledWithExactly(testAddr.address, address.toJSON())
        && dataStubSet.getCalls()[1].should.have.been.calledWithExactly(repoDataKey, [testAddr.address])
    })
  })

  it('should clear all addresses properly', () => {
    const nonce1 = '4f73efa2-8849-4cd4-9b2c-7e2796c8f08f'
    const nonce2 = 'b2577f61-b358-44d0-a1c2-951d7d5f7f03'
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([nonce1, nonce2])
    const dataStubRemove = sinon.stub(dataStorage, 'remove')

    return sut.clearAll().then(() => {
      sinon.assert.calledWithExactly(dataStubRemove.getCall(0), nonce1)
      sinon.assert.calledWithExactly(dataStubRemove.getCall(1), nonce2)
      sinon.assert.calledWithExactly(dataStubRemove.getCall(2), repoDataKey)
      return dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
        && dataStubRemove.callCount.should.be.equal(3)
    })
  })
})

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
import { IVcTransaction, VcTransaction, VerifiableCredentialTransactionRepository } from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'
import { VerifiableCredential } from 'vp-toolkit-models'

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

const transactionWithoutOptionals: IVcTransaction = {
  created: new Date(Date.UTC(2019, 5, 25, 9, 5, 1)),
  uuid: '613c074b-1f12-467e-939d-a96aee1bf9e7',
  counterpartyId: '0x886D376fFfA77eFa806bBF72Cc1B181DD91Ef3A5'
}

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

describe('VC Transaction Repository', function () {
  const dataStorage = new DataStorageMock()
  const repoDataKey = 'vc_transactions'
  const sut = new VerifiableCredentialTransactionRepository(dataStorage)

  afterEach(() => {
    sinon.restore()
  })

  it('should return the correct array for findAll', () => {
    // Arranging and fake data to be returned from stub
    const firstAddress = new VcTransaction(transactionWithoutOptionals)
    const secondAddress = new VcTransaction(fullTransaction)
    const dataResult = [firstAddress, secondAddress]
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onFirstCall().resolves([
        transactionWithoutOptionals.uuid,
        fullTransaction.uuid
      ])
      .onSecondCall().resolves(dataResult[0].toJSON())
      .onThirdCall().resolves(dataResult[1].toJSON())

    // Act
    return sut.findAll().then((value) => {
      // Assert
      return value.should.deep.equal(dataResult)
        && dataStubGet.getCalls().length.should.be.equal(3)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(repoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(transactionWithoutOptionals.uuid)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(fullTransaction.uuid)
    })
  })

  it('should return an empty array for findAll when storage is empty', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // No results

    return sut.findAll().then((value) => {
      return value.should.deep.equal([])
        && dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
    })
  })

  it('should throw when trying to find transaction details for one non-existing uuid', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // Unknown item
    const uuid = '0f0f2b50-39c2-4cdd-923d-2f6f26c9e219'

    const findAction = sut.findOneByUuid(uuid)

    dataStubGet.should.have.been.calledOnceWithExactly(uuid)
    return findAction.should.have.been.rejectedWith('No transactions found')
  })

  it('should overwrite one transaction properly', () => {
    const transaction = new VcTransaction(fullTransaction)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([fullTransaction.uuid])

    return sut.saveOne(transaction).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
        && dataStubSet.should.have.been.calledOnceWithExactly(fullTransaction.uuid, transaction.toJSON())
    })
  })

  it('should save one address properly', () => {
    const transaction = new VcTransaction(fullTransaction)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([])

    return sut.saveOne(transaction).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(repoDataKey)
        && dataStubSet.getCalls().length.should.be.equal(2)
        && dataStubSet.getCalls()[0].should.have.been.calledWithExactly(fullTransaction.uuid, transaction.toJSON())
        && dataStubSet.getCalls()[1].should.have.been.calledWithExactly(repoDataKey, [fullTransaction.uuid])
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

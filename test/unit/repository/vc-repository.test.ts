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
import { VerifiableCredentialRepository } from '../../../src'
import { DataStorageMock } from '../../mock/data-storage-mock'
import { CredentialStatus, IProof, IVerifiableCredential, VerifiableCredential } from 'vp-toolkit-models'

const testProof: IProof = {
  type: 'Secp256k1Signature2019',
  created: new Date('01-01-2019 12:34:00'),
  verificationMethod: 'pubkey',
  nonce: '71512644-2f4f-4bb9-9c9d-9f5e1fc9a1d2'
}

const testCredParams: IVerifiableCredential = {
  id: 'did:protocol:address',
  type: ['VerifiableCredential'],
  issuer: 'did:protocol:issueraddress',
  issuanceDate: new Date('01-01-2019 12:00:00'),
  credentialSubject: {
    id: 'did:protocol:holderaddress',
    'https://schema.org/givenName': 'John'
  },
  proof: testProof,
  credentialStatus: new CredentialStatus({
    id: '0x6AbAAFB672f60C16C604A29426aDA1Af9d96d440',
    type: 'vcStatusRegistry2019'
  }),
  '@context': ['https://schema.org/givenName']
}

before(() => {
  chai.should()
  chai.use(sinonChai)
  chai.use(chaiAsPromised)
})

describe('Verifiable Credential repository', function () {
  const dataStorage = new DataStorageMock()
  const vcRepoDataKey = 'verifiable_credential'
  const sut = new VerifiableCredentialRepository(dataStorage)

  afterEach(() => {
    sinon.restore()
  })

  it('should return the correct items for findByContext', () => {
    // Arranging and fake data to be returned from stub
    const firstCredential = new VerifiableCredential(testCredParams)
    const secondCredentialParams = Object.assign({}, testCredParams)
    secondCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    secondCredentialParams.proof.nonce = '4ccbcbc5-84aa-4d6a-a80b-7bb42dd7e5dc'
    secondCredentialParams['@context'] = ['https://schema.org/familyName', 'https://schema.org/address']
    const secondCredential = new VerifiableCredential(secondCredentialParams)
    const thirdCredentialParams = Object.assign({}, testCredParams)
    thirdCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    thirdCredentialParams.proof.nonce = '19167bb6-879a-4a50-8d4e-84df59cf823e'
    thirdCredentialParams['@context'] = undefined
    const thirdCredential = new VerifiableCredential(thirdCredentialParams)
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onCall(0).resolves([
        testProof.nonce,
        secondCredential.proof.nonce,
        thirdCredential.proof.nonce
      ])
      .onCall(1).resolves(firstCredential.toJSON())
      .onCall(2).resolves(secondCredential.toJSON())
      .onCall(3).resolves(thirdCredential.toJSON())

    // Act
    return sut.findByContext(/schema\.org\/givenname/i).then((value) => {
      // Assert
      const expectedFirstCredential = new VerifiableCredential(firstCredential.toJSON() as IVerifiableCredential)
      return value.should.deep.equal([expectedFirstCredential])
        && dataStubGet.getCalls().length.should.be.equal(4)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(vcRepoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(testProof.nonce)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(secondCredential.proof.nonce)
        && dataStubGet.getCalls()[3].should.have.been.calledWithExactly(thirdCredential.proof.nonce)
    })
  })

  it('should return the correct items for findByCredentialSubject', () => {
    // Arranging and fake data to be returned from stub
    const firstCredential = new VerifiableCredential(testCredParams)
    const secondCredentialParams = Object.assign({}, testCredParams)
    secondCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    secondCredentialParams.proof.nonce = '4ccbcbc5-84aa-4d6a-a80b-7bb42dd7e5dc'
    secondCredentialParams.credentialSubject = { 'https://schema.org/familyName': '', 'https://schema.org/address': '' }
    const secondCredential = new VerifiableCredential(secondCredentialParams)
    const thirdCredentialParams = Object.assign({}, testCredParams)
    thirdCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    thirdCredentialParams.proof.nonce = '19167bb6-879a-4a50-8d4e-84df59cf823e'
    thirdCredentialParams.credentialSubject = {}
    const thirdCredential = new VerifiableCredential(thirdCredentialParams)
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onCall(0).resolves([
        testProof.nonce,
        secondCredential.proof.nonce,
        thirdCredential.proof.nonce
      ])
      .onCall(1).resolves(firstCredential.toJSON())
      .onCall(2).resolves(secondCredential.toJSON())
      .onCall(3).resolves(thirdCredential.toJSON())

    // Act
    return sut.findByCredentialSubject(/schema\.org\/givenname/i).then((value) => {
      // Assert
      const expectedFirstCredential = new VerifiableCredential(firstCredential.toJSON() as IVerifiableCredential)
      return value.should.deep.equal([expectedFirstCredential])
        && dataStubGet.getCalls().length.should.be.equal(4)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(vcRepoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(testProof.nonce)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(secondCredential.proof.nonce)
        && dataStubGet.getCalls()[3].should.have.been.calledWithExactly(thirdCredential.proof.nonce)
    })
  })

  it('should return the correct items for findByIssuer', () => {
    // Arranging and fake data to be returned from stub
    const firstCredential = new VerifiableCredential(testCredParams)
    const secondCredentialParams = Object.assign({}, testCredParams)
    secondCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    secondCredentialParams.proof.nonce = '4ccbcbc5-84aa-4d6a-a80b-7bb42dd7e5dc'
    secondCredentialParams.issuer = 'issuerTwo'
    const secondCredential = new VerifiableCredential(secondCredentialParams)
    const thirdCredentialParams = Object.assign({}, testCredParams)
    thirdCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    thirdCredentialParams.proof.nonce = '19167bb6-879a-4a50-8d4e-84df59cf823e'
    secondCredentialParams.issuer = 'issuerThree'
    const thirdCredential = new VerifiableCredential(thirdCredentialParams)
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onCall(0).resolves([
        testProof.nonce,
        secondCredential.proof.nonce,
        thirdCredential.proof.nonce
      ])
      .onCall(1).resolves(firstCredential.toJSON())
      .onCall(2).resolves(secondCredential.toJSON())
      .onCall(3).resolves(thirdCredential.toJSON())

    // Act
    return sut.findByIssuer('issuerTwo').then((value) => {
      // Assert
      const expectedSecondCredential = new VerifiableCredential(secondCredential.toJSON() as IVerifiableCredential)
      return value.should.deep.equal([expectedSecondCredential])
        && dataStubGet.getCalls().length.should.be.equal(4)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(vcRepoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(testProof.nonce)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(secondCredential.proof.nonce)
        && dataStubGet.getCalls()[3].should.have.been.calledWithExactly(thirdCredential.proof.nonce)
    })
  })

  it('should return the correct array for findAll', () => {
    // Arranging and fake data to be returned from stub
    const firstCredential = new VerifiableCredential(testCredParams)
    const secondCredentialParams = Object.assign({}, testCredParams)
    secondCredentialParams.proof = Object.assign({}, testProof) // To prevent TS2532 error
    secondCredentialParams.proof.nonce = '4ccbcbc5-84aa-4d6a-a80b-7bb42dd7e5dc'
    const secondCredential = new VerifiableCredential(secondCredentialParams)
    const dataResult = [firstCredential, secondCredential]
    // Arranging stub & calls
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onFirstCall().resolves([testProof.nonce, secondCredential.proof.nonce])
      .onSecondCall().resolves(dataResult[0].toJSON())
      .onThirdCall().resolves(dataResult[1].toJSON())

    // Act
    return sut.findAll().then((value) => {
      // Assert
      const expectedDataResult = dataResult.map(cred => {
        return new VerifiableCredential(cred.toJSON() as IVerifiableCredential)
      })
      return value.should.deep.equal(expectedDataResult)
        && dataStubGet.getCalls().length.should.be.equal(3)
        && dataStubGet.getCalls()[0].should.have.been.calledWithExactly(vcRepoDataKey)
        && dataStubGet.getCalls()[1].should.have.been.calledWithExactly(testProof.nonce)
        && dataStubGet.getCalls()[2].should.have.been.calledWithExactly(secondCredential.proof.nonce)
    })
  })

  it('should return an empty array for findAll when storage is not initialized', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // Undefined storage

    return sut.findAll().then((value) => {
      return value.should.deep.equal([])
        && dataStubGet.should.have.been.calledOnceWithExactly(vcRepoDataKey)
    })
  })

  it('should throw when trying to find a single VC by a non-existing uuid', () => {
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves(undefined) // Unknown item
    const nonce = '177c9547-1db5-4188-b98c-fdac93bd51ca'

    const findAction = sut.findOneByNonce(nonce)

    dataStubGet.should.have.been.calledOnceWithExactly(nonce)
    return findAction.should.have.been.rejectedWith('No verifiable credential found')
  })

  it('should overwrite one verifiable credential properly', () => {
    const vc = new VerifiableCredential(testCredParams)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([testProof.nonce])

    return sut.saveOne(vc).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(vcRepoDataKey)
        && dataStubSet.should.have.been.calledOnceWithExactly(testProof.nonce, vc.toJSON())
    })
  })

  it('should save one verifiable credential properly', () => {
    const vc = new VerifiableCredential(testCredParams)
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([])

    return sut.saveOne(vc).then(() => {
      return dataStubGet.should.have.been.calledOnceWithExactly(vcRepoDataKey)
        && dataStubSet.getCalls().length.should.be.equal(2)
        && dataStubSet.getCalls()[0].should.have.been.calledWithExactly(testProof.nonce, vc.toJSON())
        && dataStubSet.getCalls()[1].should.have.been.calledWithExactly(vcRepoDataKey, [testProof.nonce])
    })
  })

  it('should clear all verifiable credentials properly', () => {
    const nonce1 = '4f73efa2-8849-4cd4-9b2c-7e2796c8f08f'
    const nonce2 = 'b2577f61-b358-44d0-a1c2-951d7d5f7f03'
    const dataStubGet = sinon.stub(dataStorage, 'get').resolves([nonce1, nonce2])
    const dataStubRemove = sinon.stub(dataStorage, 'remove')

    return sut.clearAll().then(() => {
      sinon.assert.calledWithExactly(dataStubRemove.getCall(0), nonce1)
      sinon.assert.calledWithExactly(dataStubRemove.getCall(1), nonce2)
      sinon.assert.calledWithExactly(dataStubRemove.getCall(2), vcRepoDataKey)
      return dataStubGet.should.have.been.calledOnceWithExactly(vcRepoDataKey)
        && dataStubRemove.callCount.should.be.equal(3)
    })
  })

  it('should save multiple verifiable credential properly', () => {
    const credsToSave = [new VerifiableCredential(testCredParams), new VerifiableCredential(testCredParams)]
    const dataStubSet = sinon.stub(dataStorage, 'set')
    const dataStubGet = sinon.stub(dataStorage, 'get')
      .onFirstCall().resolves([])
      .onSecondCall().resolves([])

    return sut.saveMultiple(credsToSave).then(() => {
      return dataStubGet.should.have.been.calledWithExactly(vcRepoDataKey)
        && dataStubGet.getCalls().length.should.be.equal(2)
        && dataStubSet.getCalls().length.should.be.equal(4)
        && dataStubSet.getCalls()[0].should.have.been.calledWithExactly(testProof.nonce, credsToSave[0].toJSON())
        && dataStubSet.getCalls()[1].should.have.been.calledWithExactly(vcRepoDataKey, [testProof.nonce])
        && dataStubSet.getCalls()[2].should.have.been.calledWithExactly(testProof.nonce, credsToSave[1].toJSON())
        && dataStubSet.getCalls()[1].should.have.been.calledWithExactly(vcRepoDataKey, [testProof.nonce])
    })
  })

  it('should throw when saving a VC without a proof', () => {
    let incorrectVc = JSON.parse(JSON.stringify(new VerifiableCredential(testCredParams)))
    incorrectVc.proof = undefined

    return sut.saveOne(incorrectVc).should.be.rejectedWith(Error, 'Verifiable credential does not contain a proof')
  })
})

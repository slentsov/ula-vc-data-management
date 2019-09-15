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

import { assert } from 'chai'
import { Address, IAddress } from '../../../src'

const testAddr: IAddress = {
  address: '0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4',
  accountId: 101,
  keyId: 532,
  predicate: 'givenName'
}

describe('Address constructor', function () {

  it('should not accept empty address', () => {
    const createSut = () => {
      return new Address({
        address: '',
        accountId: testAddr.accountId,
        keyId: testAddr.keyId,
        predicate: testAddr.predicate
      })
    }

    assert.throws(createSut, ReferenceError, 'Address and/or predicate is empty')
  })

  it('should not accept empty predicate', () => {
    const createSut = () => {
      return new Address({
        address: testAddr.address,
        accountId: testAddr.accountId,
        keyId: testAddr.keyId,
        predicate: ''
      })
    }

    assert.throws(createSut, ReferenceError, 'Address and/or predicate is empty')
  })

  it('should not throw on valid inputs', () => {
    const createSut = () => {
      return new Address(testAddr)
    }

    assert.doesNotThrow(createSut)
  })

  it('should convert a JSON object to a Address class', () => {
    const sut1 = new Address(testAddr)

    const jsonObj = JSON.parse(JSON.stringify(sut1))
    const sut2 = new Address(jsonObj)

    assert.deepEqual(sut1, sut2)
  })

  it('should return a stringified object', () => {
    const sut = new Address(testAddr)
    assert.deepEqual(JSON.stringify(sut), `{"address":"${testAddr.address}","accountId":${testAddr.accountId},"keyId":${testAddr.keyId},"predicate":"${testAddr.predicate}"}`)
  })

})

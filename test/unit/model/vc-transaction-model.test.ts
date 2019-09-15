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
import { IVcTransaction, VcTransaction } from '../../../src'
import { VerifiableCredential } from 'vp-toolkit-models'

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

describe('VcTransaction constructor', function () {

  it('should not throw on valid inputs', () => {
    const createSut = () => {
      return new VcTransaction(fullTransaction)
    }

    assert.doesNotThrow(createSut)
  })

  it('should convert a JSON object to a VcTransaction class', () => {
    const sut1 = new VcTransaction(fullTransaction)

    const jsonObj = JSON.parse(JSON.stringify(sut1))
    const sut2 = new VcTransaction(jsonObj)

    assert.deepEqual(sut1, sut2)
  })

  it('should return a stringified object (no optional fields)', () => {
    const sut = new VcTransaction(transactionWithoutOptionals)
    assert.deepEqual(JSON.stringify(sut), `{"created":"2019-06-25T09:05:01.000Z","state":"success","counterpartyId":"0x886D376fFfA77eFa806bBF72Cc1B181DD91Ef3A5","uuid":"613c074b-1f12-467e-939d-a96aee1bf9e7","issuedVcs":[],"verifiedVcs":[],"revokedVcs":[]}`)
  })

  it('should return a stringified object (with optional fields)', () => {
    const sut = new VcTransaction(fullTransaction)
    assert.deepEqual(JSON.stringify(sut), `{"created":"2019-07-01T11:22:33.000Z","state":"error","counterpartyId":"0x0e756E4ee839817571CcAD9439Fa151df340b565","error":"verificationRequirementsNotMet","uuid":"bd87b8db-0e15-4301-b667-9a2b24ba9ab4","issuedVcs":["f3df5608-156c-459f-8bfc-ed35a3d33452"],"verifiedVcs":["74e8da7d-06b3-4549-923d-9afc4eab2713","eb033f44-2518-44b4-8afa-fb21b7a9edd4"],"revokedVcs":[{}]}`)
  })

})

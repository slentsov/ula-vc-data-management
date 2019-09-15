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

import { classToPlain, Expose } from 'class-transformer'
import { v4 as uuid } from 'uuid'
import { VerifiableCredential } from 'vp-toolkit-models'

export interface IVcTransaction {
  created: Date
  uuid?: string

  /**
   * The identifier of the counterparty,
   * this is an address or public key.
   *
   * If this transaction occurs when receiving
   * new credentials, the counterparty is the
   * issuer. If the holder sends credentials
   * to the counterparty, the counterparty is the
   * verifier. Incase of both (issuing and verifying)
   * the counterparty is the issuer.
   */
  counterpartyId: string

  /**
   * 'success', 'pending' or 'error'
   * If undefined, then it is 'success'
   */
  state?: string

  /**
   * The error message if state is 'error'
   */
  error?: string

  /**
   * The proof nonces for all issued
   * VC's during this transaction
   */
  issuedVcs?: string[]

  /**
   * The proof nonces for all shared
   * VC's during this transaction
   */
  verifiedVcs?: string[]

  /**
   * All VC's that were revoked
   * in this transaction
   */
  revokedVcs?: VerifiableCredential[]
}

/**
 * This model represents a data transaction,
 * for instance, sharing or receiving
 * credential(s).
 */
export class VcTransaction {
  private readonly _created: Date
  private readonly _counterpartyId: string
  private readonly _uuid: string
  private readonly _state: string
  private readonly _error?: string
  private readonly _issuedVcs: string[]
  private readonly _verifiedVcs: string[]
  private readonly _revokedVcs: VerifiableCredential[]

  constructor (obj: IVcTransaction) {
    this._created = new Date(obj.created)
    this._counterpartyId = obj.counterpartyId
    this._uuid = obj.uuid || uuid()
    this._state = obj.state || 'success'
    this._error = obj.error
    this._issuedVcs = obj.issuedVcs || []
    this._verifiedVcs = obj.verifiedVcs || []
    this._revokedVcs = obj.revokedVcs || []
  }

  /**
   * The datetime when the transaction took place
   * @return Date
   */
  @Expose()
  get created (): Date {
    return this._created
  }

  /**
   * 'success', 'pending' or 'error'
   * By default, this value is 'success',
   * meaning that the transaction succeeded
   * @return string
   */
  @Expose()
  public get state (): string {
    return this._state
  }

  /**
   * The identifier of the counterparty,
   * this is an address or public key
   * @return string
   */
  @Expose()
  public get counterpartyId (): string {
    return this._counterpartyId
  }

  /**
   * If the state is 'error', this is
   * the error description or translatable key
   * @return string|undefined
   */
  @Expose()
  public get error (): string | undefined {
    return this._error
  }

  /**
   * The transaction uuid (v4 format)
   * @return string
   */
  @Expose()
  public get uuid (): string {
    return this._uuid
  }

  /**
   * The proof nonces for all issued
   * VC's during this transaction
   * @return {string[]}
   */
  @Expose()
  public get issuedVcs (): string[] {
    return this._issuedVcs
  }

  /**
   * The proof nonces for all shared
   * VC's during this transaction
   * @return {string[]}
   */
  @Expose()
  public get verifiedVcs (): string[] {
    return this._verifiedVcs
  }

  /**
   * All VC's that were revoked
   * in this transaction
   * @return {VerifiableCredential[]}
   */
  @Expose()
  public get revokedVcs (): VerifiableCredential[] {
    return this._revokedVcs
  }

  /**
   * Converts an Address object to a json string
   * @return object
   */
  public toJSON (): object {
    return classToPlain(this, { excludePrefixes: ['_'] })
  }

}

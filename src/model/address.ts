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

export interface IAddress {
  address: string
  accountId: number
  keyId: number
  predicate: string
}

/**
 * This model binds the address to an
 * accountId, keyId and predicate.
 * The accountId and keyId are used to
 * derive the private key so signatures
 * can be made.
 */
export class Address {
  private readonly _address: string
  private readonly _accountId: number
  private readonly _keyId: number
  private readonly _predicate: string

  constructor (obj: IAddress) {
    if (!obj.address || !obj.predicate) {
      throw new ReferenceError('Address and/or predicate is empty')
    }

    this._address = obj.address
    this._accountId = obj.accountId
    this._keyId = obj.keyId
    this._predicate = obj.predicate
  }

  /**
   * The public address (like 0x58c1...)
   * @return number
   */
  @Expose()
  get address (): string {
    return this._address
  }

  /**
   * The accountId part of the HD-key path
   * @return number
   */
  @Expose()
  get accountId (): number {
    return this._accountId
  }

  /**
   * The keyId part of the HD-key path
   * @return number
   */
  @Expose()
  get keyId (): number {
    return this._keyId
  }

  /**
   * The purpose for this address
   * @return string
   */
  @Expose()
  get predicate (): string {
    return this._predicate
  }

  /**
   * Converts an Address object to a json string
   * @return object
   */
  public toJSON (): object {
    return classToPlain(this, { excludePrefixes: ['_'] })
  }

}

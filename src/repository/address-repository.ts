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

import { Address, DataStorage } from '..'

/**
 * This repository keeps track of the
 * generated addresses. Every address is generated
 * by using a accountId and keyId and is
 * bound to a predicate.
 * Example: 0xd1a4353.. is generated for
 * a 'givenName' Address.
 */
export class AddressRepository {
  private readonly ADDRESS_STORAGE_KEY = 'address'

  /**
   * Accepting a DataStorage implementation.
   * This can be eg. localstorage for a
   * browser environment.
   *
   * @param {DataStorage} _storage
   */
  public constructor (private _storage: DataStorage) {
  }

  /**
   * Finds all stored addresses
   *
   * @return {Promise<Address[]>} will be empty when no results were found
   */
  public async findAll (): Promise<Address[]> {
    let uuids = await this.getAddresses()
    let addresses: Address[] = []

    for (let uuid of uuids) {
      let addr = await this.findOneByPubAddress(uuid)
      addresses.push(addr)
    }

    return addresses
  }

  /**
   * Finds details (accountId, keyId, predicate)
   * for one address using the public 0x address.
   *
   * @throws Error when nothing is found or when the stored format is not valid
   * @param {string} address
   * @return {Promise<Address>}
   */
  public async findOneByPubAddress (address: string): Promise<Address> {
    let addressObject = await this._storage.get(address)

    if (addressObject) {
      return new Address(addressObject)
    }

    throw new Error('No address details found')
  }

  /**
   * Saves one Address object to the provided
   * storage medium. The storage key will be public
   * address, so that needs to be unique.
   * If the address key already exists in the storage,
   * all details will be overwritten.
   *
   * @param {Address} address
   * @return {Promise<void>}
   */
  public async saveOne (address: Address) {
    let addresses = await this.getAddresses()
    await this._storage.set(address.address, address.toJSON())
    if (!addresses.includes(address.address)) {
      addresses.push(address.address)
      await this._storage.set(this.ADDRESS_STORAGE_KEY, addresses)
    }
  }

  /**
   * Remove all addresses,
   * including the index.
   *
   * @return {Promise<void>}
   */
  public async clearAll () {
    let nonces = await this.getAddresses()

    for (let nonce of nonces) {
      await this._storage.remove(nonce)
    }

    await this._storage.remove(this.ADDRESS_STORAGE_KEY)
  }

  /**
   * All addresses are saved separately
   * using a key value pair. To keep track
   * of all saved addresses, an index
   * will be kept, containing all the addresses.
   *
   * @return {Promise<Array<string>>}
   */
  private async getAddresses (): Promise<Array<string>> {
    let addresses = await this._storage.get(this.ADDRESS_STORAGE_KEY)

    if (!addresses) {
      addresses = []
    }

    return addresses
  }
}

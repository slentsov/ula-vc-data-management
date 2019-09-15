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

import { DataStorage, VcTransaction, VCTransactionRepository } from '..'

/**
 * This repository adds an abstraction layer
 * between implementation code and the storage.
 * It gives us easy-to-use functions to get
 * and set transactions.
 */
export class VerifiableCredentialTransactionRepository implements VCTransactionRepository {
  private readonly VC_TRANSACTIONS_STORAGE_KEY = 'vc_transactions'

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
   * Finds all stored Transactions
   *
   * @return {Promise<VcTransaction[]>} will be empty when no results were found
   */
  public async findAll (): Promise<VcTransaction[]> {
    let uuids = await this.getTransactionUuids()
    let transactions: VcTransaction[] = []

    for (let uuid of uuids) {
      let tx = await this.findOneByUuid(uuid)
      transactions.push(tx)
    }

    return transactions
  }

  /**
   * Finds one Transaction using the uuid
   *
   * @throws Error when nothing is found or when the stored Transaction format is not valid
   * @param {string} uuid
   * @return {Promise<VcTransaction>}
   */
  public async findOneByUuid (uuid: string): Promise<VcTransaction> {
    let vcObject = await this._storage.get(uuid)

    if (vcObject) {
      return new VcTransaction(vcObject)
    }

    throw new Error('No transactions found')
  }

  /**
   * Saves one Transaction to the provided
   * storage medium. The storage key will be the uuid
   * from the Transaction, so that needs to be unique.
   * If the uuid already exists, the Transaction will be
   * overwritten.
   *
   * @param {VcTransaction} transaction
   * @return {Promise<void>}
   */
  public async saveOne (transaction: VcTransaction) {
    let uuids = await this.getTransactionUuids()
    await this._storage.set(transaction.uuid, transaction.toJSON())
    if (!uuids.includes(transaction.uuid)) {
      uuids.push(transaction.uuid)
      await this._storage.set(this.VC_TRANSACTIONS_STORAGE_KEY, uuids)
    }
  }

  /**
   * Remove all Transactions,
   * including the index.
   *
   * @return {Promise<void>}
   */
  public async clearAll () {
    let uuids = await this.getTransactionUuids()

    for (let uuid of uuids) {
      await this._storage.remove(uuid)
    }

    await this._storage.remove(this.VC_TRANSACTIONS_STORAGE_KEY)
  }

  /**
   * All Transactions are saved separately
   * using a key value pair. To keep track
   * of all saved credentials, an index
   * will be kept, containing all the uuids.
   *
   * @return {Promise<Array<string>>}
   */
  private async getTransactionUuids (): Promise<Array<string>> {
    let uuids = await this._storage.get(this.VC_TRANSACTIONS_STORAGE_KEY)

    if (!uuids) {
      uuids = []
    }

    return uuids
  }
}

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

import { VerifiableCredential } from 'vp-toolkit-models'
import { DataStorage, VCRepository } from '..'

/**
 * This repository adds an abstraction layer
 * between implementation code and the storage.
 * It gives us easy-to-use functions to get
 * and set verifiable credentials.
 */
export class VerifiableCredentialRepository implements VCRepository {
  private readonly VERIFIABLE_CREDENTIAL_STORAGE_KEY = 'verifiable_credential'

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
   * Finds all stored Verifiable Credentials
   *
   * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
   */
  public async findAll (): Promise<VerifiableCredential[]> {
    let uuids = await this.getVerifiableCredentialNonces()
    let verifiableCredentials: VerifiableCredential[] = []

    for (let uuid of uuids) {
      let vc = await this.findOneByNonce(uuid)
      verifiableCredentials.push(vc)
    }

    return verifiableCredentials
  }

  /**
   * Finds one or more Verifiable Credentials
   * that match the given credential subject key regex.
   *
   * @example findByCredentialSubject(/schema\.org\/givenname/i)
   *
   * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
   */
  public async findByCredentialSubject (subject: RegExp): Promise<VerifiableCredential[]> {
    let uuids = await this.getVerifiableCredentialNonces()
    let verifiableCredentials: VerifiableCredential[] = []

    for (let uuid of uuids) {
      let vc = await this.findOneByNonce(uuid)
      if (vc.credentialSubject && Object.keys(vc.credentialSubject).filter((val) => val.match(subject)).length > 0) {
        verifiableCredentials.push(vc)
      }
    }

    return verifiableCredentials
  }

  /**
   * Finds one or more Verifiable Credentials
   * that match the given context.
   *
   * @example findByContext(/schema\.org\/givenname/i)
   *
   * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
   */
  public async findByContext (context: RegExp): Promise<VerifiableCredential[]> {
    let uuids = await this.getVerifiableCredentialNonces()
    let verifiableCredentials: VerifiableCredential[] = []

    for (let uuid of uuids) {
      let vc = await this.findOneByNonce(uuid)
      if (vc.context && vc.context.filter((val) => val.match(context)).length > 0) {
        verifiableCredentials.push(vc)
      }
    }

    return verifiableCredentials
  }

  /**
   * Finds one Verifiable Credential using the
   * nonce, which is located in the VC's proof.
   *
   * @throws Error when nothing is found or when the stored VC format is not valid
   * @param {string} uuid
   * @return {Promise<VerifiableCredential>}
   */
  public async findOneByNonce (uuid: string): Promise<VerifiableCredential> {
    let vcObject = await this._storage.get(uuid)

    if (vcObject) {
      return new VerifiableCredential(vcObject)
    }

    throw new Error('No verifiable credential found')
  }

  /**
   * Finds Verifiable Credentials using the
   * issuer field.
   *
   * @param {string} issuer
   * @return {Promise<VerifiableCredential[]>}
   */
  public async findByIssuer (issuer: string): Promise<VerifiableCredential[]> {
    let uuids = await this.getVerifiableCredentialNonces()
    let verifiableCredentials: VerifiableCredential[] = []

    for (let uuid of uuids) {
      let vc = await this.findOneByNonce(uuid)
      if (vc.issuer === issuer) {
        verifiableCredentials.push(vc)
      }
    }

    return verifiableCredentials
  }

  /**
   * Saves one Verifiable Credential to the provided
   * storage medium. The storage key will be the nonce
   * from the VC's proof, so that needs to be unique.
   * If the proof nonce is the same, the VC will be
   * overwritten.
   *
   * @throws Error when the proof or nonce is undefined
   * @param {VerifiableCredential} verifiableCredential
   * @return {Promise<void>}
   */
  public async saveOne (verifiableCredential: VerifiableCredential) {
    let uuids = await this.getVerifiableCredentialNonces()

    if (verifiableCredential.proof && verifiableCredential.proof.nonce) {
      await this._storage.set(verifiableCredential.proof.nonce, verifiableCredential.toJSON())
      if (!uuids.includes(verifiableCredential.proof.nonce)) {
        uuids.push(verifiableCredential.proof.nonce)
        await this._storage.set(this.VERIFIABLE_CREDENTIAL_STORAGE_KEY, uuids)
      }
    } else {
      throw new Error('Verifiable credential does not contain a proof')
    }
  }

  /**
   * Saves an array of Verifiable Credentials to the
   * provided storage medium. The storage key will be
   * the nonce from the VC's proof, so that needs to
   * be unique.
   * If the proof nonce is the same, the VC will be
   * overwritten.
   *
   * @throws Error when the proof or nonce is undefined
   * @param {VerifiableCredential[]} verifiableCredentials
   * @return {Promise<void>}
   */
  public async saveMultiple (verifiableCredentials: VerifiableCredential[]) {
    for (let vc of verifiableCredentials) {
      await this.saveOne(vc)
    }
  }

  /*
    public async removeOne (verifiableCredential: VerifiableCredential) {
      let uuids = await this.getVerifiableCredentialNonces()

      const idx = uuids.indexOf(verifiableCredential.proof.nonce)
      if (verifiableCredential.proof.nonce && idx >= 0) {
        uuids.splice(idx, 1)
        await this._storage.remove(verifiableCredential.proof.nonce)
      }
      await this._storage.set(this.VERIFIABLE_CREDENTIAL_STORAGE_KEY, uuids)
    }

    public async removeMultiple (verifiableCredentials: VerifiableCredential[]) {
      let uuids = await this.getVerifiableCredentialNonces()

      for (let vc of verifiableCredentials) {
        const idx = uuids.indexOf(vc.proof.nonce)
        if (vc.proof.nonce && idx >= 0) {
          uuids.splice(idx, 1)
          await this._storage.remove(vc.proof.nonce)
        }
      }
      await this._storage.set(this.VERIFIABLE_CREDENTIAL_STORAGE_KEY, uuids)
    }
  */

  /**
   * Remove all VerifiableCredentials,
   * including the index.
   *
   * @return {Promise<void>}
   */
  public async clearAll () {
    let nonces = await this.getVerifiableCredentialNonces()

    for (let nonce of nonces) {
      await this._storage.remove(nonce)
    }

    await this._storage.remove(this.VERIFIABLE_CREDENTIAL_STORAGE_KEY)
  }

  /**
   * All credentials are saved separately
   * using a key value pair. To keep track
   * of all saved credentials, an index
   * will be kept, containing all the nonces.
   *
   * @return {Promise<Array<string>>}
   */
  private async getVerifiableCredentialNonces (): Promise<Array<string>> {
    let uuids = await this._storage.get(this.VERIFIABLE_CREDENTIAL_STORAGE_KEY)

    if (!uuids) {
      uuids = []
    }

    return uuids
  }
}

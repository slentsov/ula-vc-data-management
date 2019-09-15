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

import {
  Attestation,
  Attestor,
  EventHandler,
  IAttestation,
  Message,
  Plugin,
  Transaction,
  UlaResponse
} from 'universal-ledger-agent'
import { VCRepository } from './interface/vc-repository'
import { AddressRepository } from './repository/address-repository'
import { Address } from './model/address'
import { VerifiableCredential } from 'vp-toolkit-models'
import { VcTransaction } from './model/vc-transaction'
import { VCTransactionRepository } from './interface/vc-transaction-repository'

export class VcDataManagement implements Plugin {
  private _eventHandler?: EventHandler
  private readonly _listeningToTypes = [
    'save-vcs',
    'get-vcs-by-context',
    'get-vcs-by-subject',
    'save-address',
    'save-vc-transaction',
    'get-address-details',
    'get-attestations',
    'get-attestors',
    'get-new-key-id',
    'data-clear-all',
    'get-transactions'
  ]

  constructor (private _verifiableCredentialRepo: VCRepository, private _addressRepo: AddressRepository, private _vcTransactionRepo: VCTransactionRepository) {
  }

  get name () {
    return 'VerifiableCredentialDataManagement'
  }

  initialize (eventHandler: EventHandler) {
    this._eventHandler = eventHandler
  }

  async handleEvent (message: Message, callback: any): Promise<string> {
    if (!this._eventHandler && this._listeningToTypes.includes(message.properties.type)) {
      throw new Error('Plugin not initialized. Did you forget to call initialize() ?')
    }

    if (message.properties.type === 'save-vcs') {
      await this._verifiableCredentialRepo.saveMultiple(message.properties.verifiableCredentials)
      return 'success'
    } else if (message.properties.type === 'get-vcs-by-context') {
      const dataResult = await this._verifiableCredentialRepo.findByContext(message.properties.contextRegex)
      callback(dataResult)
      return 'success'
    } else if (message.properties.type === 'get-vcs-by-subject') {
      const dataResult = await this._verifiableCredentialRepo.findByCredentialSubject(message.properties.contextRegex)
      callback(dataResult)
      return 'success'
    } else if (message.properties.type === 'save-address') {
      await this._addressRepo.saveOne(new Address(message.properties.address))
      return 'success'
    } else if (message.properties.type === 'save-vc-transaction') {
      await this._vcTransactionRepo.saveOne(new VcTransaction(message.properties.transaction))
      return 'success'
    } else if (message.properties.type === 'get-address-details') {
      const dataResult = await this._addressRepo.findOneByPubAddress(message.properties.publicAddress)
      callback(dataResult)
      return 'success'
    } else if (message.properties.type === 'get-new-key-id') {
      const allAddresses = await this._addressRepo.findAll()
      let highestKeyId = 0
      for (const address of allAddresses) {
        highestKeyId = Math.max(address.keyId, highestKeyId)
      }
      callback(highestKeyId + 1)
      return 'success'
    } else if (message.properties.type === 'get-attestations') {
      const dataResult = await this._verifiableCredentialRepo.findAll()
      const attestations: Attestation[] = []
      for (const credential of dataResult) {
        attestations.push(new Attestation(this.transformCredentialToIAttestation(credential)))
      }
      callback(new UlaResponse({ statusCode: 200, body: attestations }))
      return 'success'
    } else if (message.properties.type === 'get-attestors') {
      const attestors: Attestor[] = []
      const dataResult = await this._verifiableCredentialRepo.findAll()
      for (const verifiableCredential of dataResult) {
        const attestor = await this.extractAttestorFromVerifiableCredential(verifiableCredential)
        if (attestors.every((ar) => ar.pubKey !== attestor.pubKey)) {
          attestors.push(attestor)
        }
      }
      callback(new UlaResponse({ statusCode: 200, body: attestors }))
      return 'success'
    } else if (message.properties.type === 'data-clear-all') {
      await this._verifiableCredentialRepo.clearAll()
      await this._addressRepo.clearAll()
      return 'success'
    } else if (message.properties.type === 'get-transactions') {
      const vcTransactions = await this._vcTransactionRepo.findAll()
      const transactions = await this.transformVcTransactionsToTransactions(vcTransactions)
      callback(new UlaResponse({ statusCode: 200, body: transactions }))
      return 'success'
    }

    return 'ignored'
  }

  /**
   * Will extract attestor information from the
   * given VerifiableCredential.
   *
   * @param {VerifiableCredential} vc
   * @return {Attestor}
   */
  private async extractAttestorFromVerifiableCredential (vc: VerifiableCredential): Promise<Attestor> {
    const credentials = await this._verifiableCredentialRepo.findByIssuer(vc.issuer)
    const attestations: Attestation[] = []
    for (const credential of credentials) {
      attestations.push(new Attestation(this.transformCredentialToIAttestation(credential)))
    }

    return new Attestor({
      name: vc.additionalFields['issuerName'] ? vc.additionalFields['issuerName'] : 'Unknown',
      pubKey: vc.proof.verificationMethod,
      datetime: vc.issuanceDate,
      icon: vc.additionalFields['issuerIcon'] ? vc.additionalFields['issuerIcon'] : 'Unknown',
      transactions: [],
      receivedAttestations: [],
      issuedAttestations: attestations
    })
  }

  /**
   * Takes an array of VerifiableCredential
   * objects and maps them to the Attestor
   * data model so it can be displayed to
   * the holder.
   *
   * @todo: Switch attestorPubKey to credential.issuer after ChallengeRequest contains the issuer DID as well
   * @param {VerifiableCredential} credential
   * @return {Attestation}
   */
  private transformCredentialToIAttestation (credential: VerifiableCredential): IAttestation {
    const statements = this.transformCredentialSubjectsToStatements(credential.credentialSubject)
    return {
      uuid: credential.proof.nonce,
      attestorPubKey: credential.proof.verificationMethod,
      forPubKey: credential.credentialSubject.id,
      type: [credential.proof.type],
      datetime: credential.issuanceDate,
      statements: statements,
      context: credential.context || ['https://www.w3.org/2018/credentials/v1']
    }
  }

  /**
   * Transforms CredentialSubjects to
   * statements by leaving out the 'id'
   * field and only using the predicate
   * without the entire URL,
   * so 'http://schema.org/test/fullName'
   * will become 'fullName'.
   *
   * @param credentialSubject
   * @return {any}
   */
  private transformCredentialSubjectsToStatements (credentialSubject: any): any {
    const statements: any = {}
    for (const csKey of Object.keys(credentialSubject)) {
      const splittedKey = csKey.split('/')
      const keyWithoutUrl = splittedKey[splittedKey.length - 1]
      statements[keyWithoutUrl] = credentialSubject[csKey]
    }
    delete statements.id

    return statements
  }

  /**
   * Transforms VC Transactions to ULA Transactions
   *
   * @param vcTransactions
   * @return {Transaction[]}
   */
  private async transformVcTransactionsToTransactions (vcTransactions: VcTransaction[]): Promise<Transaction[]> {
    const transactions: Transaction[] = []

    for (const vcTransaction of vcTransactions) {
      const attestedVcs: VerifiableCredential[] = []
      const verifiedVcs: VerifiableCredential[] = []
      for (const issuedVc of vcTransaction.issuedVcs) {
        attestedVcs.push(await this._verifiableCredentialRepo.findOneByNonce(issuedVc))
      }
      for (const verifiedVc of vcTransaction.verifiedVcs) {
        verifiedVcs.push(await this._verifiableCredentialRepo.findOneByNonce(verifiedVc))
      }

      transactions.push(new Transaction({
        uuid: vcTransaction.uuid,
        attestorPubKey: vcTransaction.counterpartyId,
        datetime: vcTransaction.created,
        attest: attestedVcs.map(vc => this.transformCredentialToIAttestation(vc)),
        verifyRequest: verifiedVcs.map(vc => this.transformCredentialToIAttestation(vc)),
        revoke: vcTransaction.revokedVcs.map(vc => this.transformCredentialToIAttestation(vc))
      }))
    }

    return transactions
  }
}

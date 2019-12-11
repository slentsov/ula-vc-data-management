"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const universal_ledger_agent_1 = require("universal-ledger-agent");
const address_1 = require("./model/address");
const vc_transaction_1 = require("./model/vc-transaction");
class VcDataManagement {
    constructor(_verifiableCredentialRepo, _addressRepo, _vcTransactionRepo) {
        this._verifiableCredentialRepo = _verifiableCredentialRepo;
        this._addressRepo = _addressRepo;
        this._vcTransactionRepo = _vcTransactionRepo;
        this._listeningToTypes = [
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
        ];
    }
    get name() {
        return 'VerifiableCredentialDataManagement';
    }
    initialize(eventHandler) {
        this._eventHandler = eventHandler;
    }
    handleEvent(message, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._eventHandler && this._listeningToTypes.includes(message.properties.type)) {
                throw new Error('Plugin not initialized. Did you forget to call initialize() ?');
            }
            if (message.properties.type === 'save-vcs') {
                yield this._verifiableCredentialRepo.saveMultiple(message.properties.verifiableCredentials);
                return 'success';
            }
            else if (message.properties.type === 'get-vcs-by-context') {
                const dataResult = yield this._verifiableCredentialRepo.findByContext(message.properties.contextRegex);
                callback(dataResult);
                return 'success';
            }
            else if (message.properties.type === 'get-vcs-by-subject') {
                const dataResult = yield this._verifiableCredentialRepo.findByCredentialSubject(message.properties.contextRegex);
                callback(dataResult);
                return 'success';
            }
            else if (message.properties.type === 'save-address') {
                yield this._addressRepo.saveOne(new address_1.Address(message.properties.address));
                return 'success';
            }
            else if (message.properties.type === 'save-vc-transaction') {
                yield this._vcTransactionRepo.saveOne(new vc_transaction_1.VcTransaction(message.properties.transaction));
                return 'success';
            }
            else if (message.properties.type === 'get-address-details') {
                const dataResult = yield this._addressRepo.findOneByPubAddress(message.properties.publicAddress);
                callback(dataResult);
                return 'success';
            }
            else if (message.properties.type === 'get-new-key-id') {
                const allAddresses = yield this._addressRepo.findAll();
                let highestKeyId = 0;
                for (const address of allAddresses) {
                    highestKeyId = Math.max(address.keyId, highestKeyId);
                }
                callback(highestKeyId + 1);
                return 'success';
            }
            else if (message.properties.type === 'get-attestations') {
                const dataResult = yield this._verifiableCredentialRepo.findAll();
                const attestations = [];
                for (const credential of dataResult) {
                    attestations.push(new universal_ledger_agent_1.Attestation(this.transformCredentialToIAttestation(credential)));
                }
                callback(new universal_ledger_agent_1.UlaResponse({ statusCode: 200, body: attestations }));
                return 'success';
            }
            else if (message.properties.type === 'get-attestors') {
                const attestors = [];
                const dataResult = yield this._verifiableCredentialRepo.findAll();
                for (const verifiableCredential of dataResult) {
                    const attestor = yield this.extractAttestorFromVerifiableCredential(verifiableCredential);
                    if (attestors.every((ar) => ar.pubKey !== attestor.pubKey)) {
                        attestors.push(attestor);
                    }
                }
                callback(new universal_ledger_agent_1.UlaResponse({ statusCode: 200, body: attestors }));
                return 'success';
            }
            else if (message.properties.type === 'data-clear-all') {
                yield this._verifiableCredentialRepo.clearAll();
                yield this._addressRepo.clearAll();
                return 'success';
            }
            else if (message.properties.type === 'get-transactions') {
                const vcTransactions = yield this._vcTransactionRepo.findAll();
                const transactions = yield this.transformVcTransactionsToTransactions(vcTransactions);
                callback(new universal_ledger_agent_1.UlaResponse({ statusCode: 200, body: transactions }));
                return 'success';
            }
            return 'ignored';
        });
    }
    /**
     * Will extract attestor information from the
     * given VerifiableCredential.
     *
     * @param {VerifiableCredential} vc
     * @return {Attestor}
     */
    extractAttestorFromVerifiableCredential(vc) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentials = yield this._verifiableCredentialRepo.findByIssuer(vc.issuer);
            const attestations = [];
            for (const credential of credentials) {
                attestations.push(new universal_ledger_agent_1.Attestation(this.transformCredentialToIAttestation(credential)));
            }
            return new universal_ledger_agent_1.Attestor({
                name: vc.additionalFields['issuerName'] ? vc.additionalFields['issuerName'] : 'Unknown',
                pubKey: vc.proof.verificationMethod,
                datetime: vc.issuanceDate,
                icon: vc.additionalFields['issuerIcon'] ? vc.additionalFields['issuerIcon'] : 'Unknown',
                transactions: [],
                receivedAttestations: [],
                issuedAttestations: attestations
            });
        });
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
    transformCredentialToIAttestation(credential) {
        const statements = this.transformCredentialSubjectsToStatements(credential.credentialSubject);
        return {
            uuid: credential.proof.nonce,
            attestorPubKey: credential.proof.verificationMethod,
            forPubKey: credential.credentialSubject.id,
            type: [credential.proof.type],
            datetime: credential.issuanceDate,
            statements: statements,
            context: credential.context || ['https://www.w3.org/2018/credentials/v1']
        };
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
    transformCredentialSubjectsToStatements(credentialSubject) {
        const statements = {};
        for (const csKey of Object.keys(credentialSubject)) {
            const splittedKey = csKey.split('/');
            const keyWithoutUrl = splittedKey[splittedKey.length - 1];
            statements[keyWithoutUrl] = credentialSubject[csKey];
        }
        delete statements.id;
        return statements;
    }
    /**
     * Transforms VC Transactions to ULA Transactions
     *
     * @param vcTransactions
     * @return {Transaction[]}
     */
    transformVcTransactionsToTransactions(vcTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = [];
            for (const vcTransaction of vcTransactions) {
                const attestedVcs = [];
                const verifiedVcs = [];
                for (const issuedVc of vcTransaction.issuedVcs) {
                    attestedVcs.push(yield this._verifiableCredentialRepo.findOneByNonce(issuedVc));
                }
                for (const verifiedVc of vcTransaction.verifiedVcs) {
                    verifiedVcs.push(yield this._verifiableCredentialRepo.findOneByNonce(verifiedVc));
                }
                transactions.push(new universal_ledger_agent_1.Transaction({
                    uuid: vcTransaction.uuid,
                    attestorPubKey: vcTransaction.counterpartyId,
                    datetime: vcTransaction.created,
                    attest: attestedVcs.map(vc => this.transformCredentialToIAttestation(vc)),
                    verifyRequest: verifiedVcs.map(vc => this.transformCredentialToIAttestation(vc)),
                    revoke: vcTransaction.revokedVcs.map(vc => this.transformCredentialToIAttestation(vc))
                }));
            }
            return transactions;
        });
    }
}
exports.VcDataManagement = VcDataManagement;
//# sourceMappingURL=vc-data-mgmt.js.map
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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
/**
 * This repository adds an abstraction layer
 * between implementation code and the storage.
 * It gives us easy-to-use functions to get
 * and set transactions.
 */
class VerifiableCredentialTransactionRepository {
    /**
     * Accepting a DataStorage implementation.
     * This can be eg. localstorage for a
     * browser environment.
     *
     * @param {DataStorage} _storage
     */
    constructor(_storage) {
        this._storage = _storage;
        this.VC_TRANSACTIONS_STORAGE_KEY = 'vc_transactions';
    }
    /**
     * Finds all stored Transactions
     *
     * @return {Promise<VcTransaction[]>} will be empty when no results were found
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let uuids = yield this.getTransactionUuids();
            let transactions = [];
            for (let uuid of uuids) {
                let tx = yield this.findOneByUuid(uuid);
                transactions.push(tx);
            }
            return transactions;
        });
    }
    /**
     * Finds one Transaction using the uuid
     *
     * @throws Error when nothing is found or when the stored Transaction format is not valid
     * @param {string} uuid
     * @return {Promise<VcTransaction>}
     */
    findOneByUuid(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let vcObject = yield this._storage.get(uuid);
            if (vcObject) {
                return new __1.VcTransaction(vcObject);
            }
            throw new Error('No transactions found');
        });
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
    saveOne(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let uuids = yield this.getTransactionUuids();
            yield this._storage.set(transaction.uuid, transaction.toJSON());
            if (!uuids.includes(transaction.uuid)) {
                uuids.push(transaction.uuid);
                yield this._storage.set(this.VC_TRANSACTIONS_STORAGE_KEY, uuids);
            }
        });
    }
    /**
     * Remove all Transactions,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let uuids = yield this.getTransactionUuids();
            for (let uuid of uuids) {
                yield this._storage.remove(uuid);
            }
            yield this._storage.remove(this.VC_TRANSACTIONS_STORAGE_KEY);
        });
    }
    /**
     * All Transactions are saved separately
     * using a key value pair. To keep track
     * of all saved credentials, an index
     * will be kept, containing all the uuids.
     *
     * @return {Promise<Array<string>>}
     */
    getTransactionUuids() {
        return __awaiter(this, void 0, void 0, function* () {
            let uuids = yield this._storage.get(this.VC_TRANSACTIONS_STORAGE_KEY);
            if (!uuids) {
                uuids = [];
            }
            return uuids;
        });
    }
}
exports.VerifiableCredentialTransactionRepository = VerifiableCredentialTransactionRepository;
//# sourceMappingURL=verifiable-credential-transaction-repository.js.map
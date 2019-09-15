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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const uuid_1 = require("uuid");
/**
 * This model represents a data transaction,
 * for instance, sharing or receiving
 * credential(s).
 */
class VcTransaction {
    constructor(obj) {
        this._created = new Date(obj.created);
        this._counterpartyId = obj.counterpartyId;
        this._uuid = obj.uuid || uuid_1.v4();
        this._state = obj.state || 'success';
        this._error = obj.error;
        this._issuedVcs = obj.issuedVcs || [];
        this._verifiedVcs = obj.verifiedVcs || [];
        this._revokedVcs = obj.revokedVcs || [];
    }
    /**
     * The datetime when the transaction took place
     * @return Date
     */
    get created() {
        return this._created;
    }
    /**
     * 'success', 'pending' or 'error'
     * By default, this value is 'success',
     * meaning that the transaction succeeded
     * @return string
     */
    get state() {
        return this._state;
    }
    /**
     * The identifier of the counterparty,
     * this is an address or public key
     * @return string
     */
    get counterpartyId() {
        return this._counterpartyId;
    }
    /**
     * If the state is 'error', this is
     * the error description or translatable key
     * @return string|undefined
     */
    get error() {
        return this._error;
    }
    /**
     * The transaction uuid (v4 format)
     * @return string
     */
    get uuid() {
        return this._uuid;
    }
    /**
     * The proof nonces for all issued
     * VC's during this transaction
     * @return {string[]}
     */
    get issuedVcs() {
        return this._issuedVcs;
    }
    /**
     * The proof nonces for all shared
     * VC's during this transaction
     * @return {string[]}
     */
    get verifiedVcs() {
        return this._verifiedVcs;
    }
    /**
     * All VC's that were revoked
     * in this transaction
     * @return {VerifiableCredential[]}
     */
    get revokedVcs() {
        return this._revokedVcs;
    }
    /**
     * Converts an Address object to a json string
     * @return object
     */
    toJSON() {
        return class_transformer_1.classToPlain(this, { excludePrefixes: ['_'] });
    }
}
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "created", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "state", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "counterpartyId", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "error", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "uuid", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "issuedVcs", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "verifiedVcs", null);
__decorate([
    class_transformer_1.Expose()
], VcTransaction.prototype, "revokedVcs", null);
exports.VcTransaction = VcTransaction;
//# sourceMappingURL=vc-transaction.js.map
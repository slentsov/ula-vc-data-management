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
/**
 * This model binds the address to an
 * accountId, keyId and predicate.
 * The accountId and keyId are used to
 * derive the private key so signatures
 * can be made.
 */
class Address {
    constructor(obj) {
        if (!obj.address || !obj.predicate) {
            throw new ReferenceError('Address and/or predicate is empty');
        }
        this._address = obj.address;
        this._accountId = obj.accountId;
        this._keyId = obj.keyId;
        this._predicate = obj.predicate;
    }
    /**
     * The public address (like 0x58c1...)
     * @return number
     */
    get address() {
        return this._address;
    }
    /**
     * The accountId part of the HD-key path
     * @return number
     */
    get accountId() {
        return this._accountId;
    }
    /**
     * The keyId part of the HD-key path
     * @return number
     */
    get keyId() {
        return this._keyId;
    }
    /**
     * The purpose for this address
     * @return string
     */
    get predicate() {
        return this._predicate;
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
], Address.prototype, "address", null);
__decorate([
    class_transformer_1.Expose()
], Address.prototype, "accountId", null);
__decorate([
    class_transformer_1.Expose()
], Address.prototype, "keyId", null);
__decorate([
    class_transformer_1.Expose()
], Address.prototype, "predicate", null);
exports.Address = Address;
//# sourceMappingURL=address.js.map
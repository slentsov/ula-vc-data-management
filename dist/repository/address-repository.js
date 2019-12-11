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
const __1 = require("..");
/**
 * This repository keeps track of the
 * generated addresses. Every address is generated
 * by using a accountId and keyId and is
 * bound to a predicate.
 * Example: 0xd1a4353.. is generated for
 * a 'givenName' Address.
 */
class AddressRepository {
    /**
     * Accepting a DataStorage implementation.
     * This can be eg. localstorage for a
     * browser environment.
     *
     * @param {DataStorage} _storage
     */
    constructor(_storage) {
        this._storage = _storage;
        this.ADDRESS_STORAGE_KEY = 'address';
    }
    /**
     * Finds all stored addresses
     *
     * @return {Promise<Address[]>} will be empty when no results were found
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let uuids = yield this.getAddresses();
            let addresses = [];
            for (let uuid of uuids) {
                let addr = yield this.findOneByPubAddress(uuid);
                addresses.push(addr);
            }
            return addresses;
        });
    }
    /**
     * Finds details (accountId, keyId, predicate)
     * for one address using the public 0x address.
     *
     * @throws Error when nothing is found or when the stored format is not valid
     * @param {string} address
     * @return {Promise<Address>}
     */
    findOneByPubAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let addressObject = yield this._storage.get(address);
            if (addressObject) {
                return new __1.Address(addressObject);
            }
            throw new Error('No address details found');
        });
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
    saveOne(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let addresses = yield this.getAddresses();
            yield this._storage.set(address.address, address.toJSON());
            if (!addresses.includes(address.address)) {
                addresses.push(address.address);
                yield this._storage.set(this.ADDRESS_STORAGE_KEY, addresses);
            }
        });
    }
    /**
     * Remove all addresses,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let nonces = yield this.getAddresses();
            for (let nonce of nonces) {
                yield this._storage.remove(nonce);
            }
            yield this._storage.remove(this.ADDRESS_STORAGE_KEY);
        });
    }
    /**
     * All addresses are saved separately
     * using a key value pair. To keep track
     * of all saved addresses, an index
     * will be kept, containing all the addresses.
     *
     * @return {Promise<Array<string>>}
     */
    getAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            let addresses = yield this._storage.get(this.ADDRESS_STORAGE_KEY);
            if (!addresses) {
                addresses = [];
            }
            return addresses;
        });
    }
}
exports.AddressRepository = AddressRepository;
//# sourceMappingURL=address-repository.js.map
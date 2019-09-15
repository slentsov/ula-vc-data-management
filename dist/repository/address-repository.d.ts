import { Address, DataStorage } from '..';
/**
 * This repository keeps track of the
 * generated addresses. Every address is generated
 * by using a accountId and keyId and is
 * bound to a predicate.
 * Example: 0xd1a4353.. is generated for
 * a 'givenName' Address.
 */
export declare class AddressRepository {
    private _storage;
    private readonly ADDRESS_STORAGE_KEY;
    /**
     * Accepting a DataStorage implementation.
     * This can be eg. localstorage for a
     * browser environment.
     *
     * @param {DataStorage} _storage
     */
    constructor(_storage: DataStorage);
    /**
     * Finds all stored addresses
     *
     * @return {Promise<Address[]>} will be empty when no results were found
     */
    findAll(): Promise<Address[]>;
    /**
     * Finds details (accountId, keyId, predicate)
     * for one address using the public 0x address.
     *
     * @throws Error when nothing is found or when the stored format is not valid
     * @param {string} address
     * @return {Promise<Address>}
     */
    findOneByPubAddress(address: string): Promise<Address>;
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
    saveOne(address: Address): Promise<void>;
    /**
     * Remove all addresses,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll(): Promise<void>;
    /**
     * All addresses are saved separately
     * using a key value pair. To keep track
     * of all saved addresses, an index
     * will be kept, containing all the addresses.
     *
     * @return {Promise<Array<string>>}
     */
    private getAddresses;
}

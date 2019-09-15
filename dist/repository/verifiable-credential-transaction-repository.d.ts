import { DataStorage, VcTransaction, VCTransactionRepository } from '..';
/**
 * This repository adds an abstraction layer
 * between implementation code and the storage.
 * It gives us easy-to-use functions to get
 * and set transactions.
 */
export declare class VerifiableCredentialTransactionRepository implements VCTransactionRepository {
    private _storage;
    private readonly VC_TRANSACTIONS_STORAGE_KEY;
    /**
     * Accepting a DataStorage implementation.
     * This can be eg. localstorage for a
     * browser environment.
     *
     * @param {DataStorage} _storage
     */
    constructor(_storage: DataStorage);
    /**
     * Finds all stored Transactions
     *
     * @return {Promise<VcTransaction[]>} will be empty when no results were found
     */
    findAll(): Promise<VcTransaction[]>;
    /**
     * Finds one Transaction using the uuid
     *
     * @throws Error when nothing is found or when the stored Transaction format is not valid
     * @param {string} uuid
     * @return {Promise<VcTransaction>}
     */
    findOneByUuid(uuid: string): Promise<VcTransaction>;
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
    saveOne(transaction: VcTransaction): Promise<void>;
    /**
     * Remove all Transactions,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll(): Promise<void>;
    /**
     * All Transactions are saved separately
     * using a key value pair. To keep track
     * of all saved credentials, an index
     * will be kept, containing all the uuids.
     *
     * @return {Promise<Array<string>>}
     */
    private getTransactionUuids;
}

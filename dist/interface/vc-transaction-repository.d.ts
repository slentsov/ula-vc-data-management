import { VcTransaction } from '..';
/**
 * Interface for a repository which manages
 * the data for Transaction objects.
 *
 * @see VerifiableCredentialTransactionRepository (implementation)
 */
export interface VCTransactionRepository {
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
}

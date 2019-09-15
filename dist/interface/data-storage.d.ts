/**
 * Interface for a generic key-value data storage
 * implementation. The implementation should
 * be able to get, set and remove data.
 *
 * The Verifiable Credential repository will be
 * using unique keys (nonces) and an index to
 * keep track of all the stored data.
 * @see VerifiableCredentialRepository
 */
export interface DataStorage {
    /**
     * Get data that corresponds to
     * the given key.
     *
     * @param {string} key
     * @return {Promise<any>}
     */
    get(key: string): Promise<any>;
    /**
     * Set data for the given key,
     * so it can be retrieved
     * by using the same key.
     *
     * @param {string} key
     * @param value
     * @return {Promise<void>}
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Remove a single piece of data,
     * identified by the given key.
     *
     * @param {string} key
     * @return {Promise<void>}
     */
    remove(key: string): Promise<void>;
}

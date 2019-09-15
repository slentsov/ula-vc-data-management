import { VerifiableCredential } from 'vp-toolkit-models';
import { DataStorage, VCRepository } from '..';
/**
 * This repository adds an abstraction layer
 * between implementation code and the storage.
 * It gives us easy-to-use functions to get
 * and set verifiable credentials.
 */
export declare class VerifiableCredentialRepository implements VCRepository {
    private _storage;
    private readonly VERIFIABLE_CREDENTIAL_STORAGE_KEY;
    /**
     * Accepting a DataStorage implementation.
     * This can be eg. localstorage for a
     * browser environment.
     *
     * @param {DataStorage} _storage
     */
    constructor(_storage: DataStorage);
    /**
     * Finds all stored Verifiable Credentials
     *
     * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
     */
    findAll(): Promise<VerifiableCredential[]>;
    /**
     * Finds one or more Verifiable Credentials
     * that match the given credential subject key regex.
     *
     * @example findByCredentialSubject(/schema\.org\/givenname/i)
     *
     * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
     */
    findByCredentialSubject(subject: RegExp): Promise<VerifiableCredential[]>;
    /**
     * Finds one or more Verifiable Credentials
     * that match the given context.
     *
     * @example findByContext(/schema\.org\/givenname/i)
     *
     * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
     */
    findByContext(context: RegExp): Promise<VerifiableCredential[]>;
    /**
     * Finds one Verifiable Credential using the
     * nonce, which is located in the VC's proof.
     *
     * @throws Error when nothing is found or when the stored VC format is not valid
     * @param {string} uuid
     * @return {Promise<VerifiableCredential>}
     */
    findOneByNonce(uuid: string): Promise<VerifiableCredential>;
    /**
     * Finds Verifiable Credentials using the
     * issuer field.
     *
     * @param {string} issuer
     * @return {Promise<VerifiableCredential[]>}
     */
    findByIssuer(issuer: string): Promise<VerifiableCredential[]>;
    /**
     * Saves one Verifiable Credential to the provided
     * storage medium. The storage key will be the nonce
     * from the VC's proof, so that needs to be unique.
     * If the proof nonce is the same, the VC will be
     * overwritten.
     *
     * @throws Error when the proof or nonce is undefined
     * @param {VerifiableCredential} verifiableCredential
     * @return {Promise<void>}
     */
    saveOne(verifiableCredential: VerifiableCredential): Promise<void>;
    /**
     * Saves an array of Verifiable Credentials to the
     * provided storage medium. The storage key will be
     * the nonce from the VC's proof, so that needs to
     * be unique.
     * If the proof nonce is the same, the VC will be
     * overwritten.
     *
     * @throws Error when the proof or nonce is undefined
     * @param {VerifiableCredential[]} verifiableCredentials
     * @return {Promise<void>}
     */
    saveMultiple(verifiableCredentials: VerifiableCredential[]): Promise<void>;
    /**
     * Remove all VerifiableCredentials,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll(): Promise<void>;
    /**
     * All credentials are saved separately
     * using a key value pair. To keep track
     * of all saved credentials, an index
     * will be kept, containing all the nonces.
     *
     * @return {Promise<Array<string>>}
     */
    private getVerifiableCredentialNonces;
}

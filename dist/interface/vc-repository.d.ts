import { VerifiableCredential } from 'vp-toolkit-models';
/**
 * Interface for a repository which manages
 * the data for Verifiable Credential objects.
 *
 * @see VerifiableCredentialRepository (implementation)
 */
export interface VCRepository {
    /**
     * Finds all stored Verifiable Credentials
     *
     * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
     */
    findAll(): Promise<VerifiableCredential[]>;
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
     * Finds one or more Verifiable Credentials
     * that match the given credential subject key regex.
     *
     * @example findByCredentialSubject(/schema\.org\/givenname/i)
     *
     * @return {Promise<VerifiableCredential[]>} will be empty when no results were found
     */
    findByCredentialSubject(subject: RegExp): Promise<VerifiableCredential[]>;
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
     * Finds Verifiable Credentials using the
     * issuer field.
     *
     * @param {string} issuer
     * @return {Promise<VerifiableCredential[]>}
     */
    findByIssuer(issuer: string): Promise<VerifiableCredential[]>;
    /**
     * Remove all VerifiableCredentials,
     * including the index.
     *
     * @return {Promise<void>}
     */
    clearAll(): Promise<void>;
}

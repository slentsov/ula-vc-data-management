import { VerifiableCredential } from 'vp-toolkit-models';
export interface IVcTransaction {
    created: Date;
    uuid?: string;
    /**
     * The identifier of the counterparty,
     * this is an address or public key.
     *
     * If this transaction occurs when receiving
     * new credentials, the counterparty is the
     * issuer. If the holder sends credentials
     * to the counterparty, the counterparty is the
     * verifier. Incase of both (issuing and verifying)
     * the counterparty is the issuer.
     */
    counterpartyId: string;
    /**
     * 'success', 'pending' or 'error'
     * If undefined, then it is 'success'
     */
    state?: string;
    /**
     * The error message if state is 'error'
     */
    error?: string;
    /**
     * The proof nonces for all issued
     * VC's during this transaction
     */
    issuedVcs?: string[];
    /**
     * The proof nonces for all shared
     * VC's during this transaction
     */
    verifiedVcs?: string[];
    /**
     * All VC's that were revoked
     * in this transaction
     */
    revokedVcs?: VerifiableCredential[];
}
/**
 * This model represents a data transaction,
 * for instance, sharing or receiving
 * credential(s).
 */
export declare class VcTransaction {
    private readonly _created;
    private readonly _counterpartyId;
    private readonly _uuid;
    private readonly _state;
    private readonly _error?;
    private readonly _issuedVcs;
    private readonly _verifiedVcs;
    private readonly _revokedVcs;
    constructor(obj: IVcTransaction);
    /**
     * The datetime when the transaction took place
     * @return Date
     */
    readonly created: Date;
    /**
     * 'success', 'pending' or 'error'
     * By default, this value is 'success',
     * meaning that the transaction succeeded
     * @return string
     */
    readonly state: string;
    /**
     * The identifier of the counterparty,
     * this is an address or public key
     * @return string
     */
    readonly counterpartyId: string;
    /**
     * If the state is 'error', this is
     * the error description or translatable key
     * @return string|undefined
     */
    readonly error: string | undefined;
    /**
     * The transaction uuid (v4 format)
     * @return string
     */
    readonly uuid: string;
    /**
     * The proof nonces for all issued
     * VC's during this transaction
     * @return {string[]}
     */
    readonly issuedVcs: string[];
    /**
     * The proof nonces for all shared
     * VC's during this transaction
     * @return {string[]}
     */
    readonly verifiedVcs: string[];
    /**
     * All VC's that were revoked
     * in this transaction
     * @return {VerifiableCredential[]}
     */
    readonly revokedVcs: VerifiableCredential[];
    /**
     * Converts an Address object to a json string
     * @return object
     */
    toJSON(): object;
}

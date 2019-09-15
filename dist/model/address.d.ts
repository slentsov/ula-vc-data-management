export interface IAddress {
    address: string;
    accountId: number;
    keyId: number;
    predicate: string;
}
/**
 * This model binds the address to an
 * accountId, keyId and predicate.
 * The accountId and keyId are used to
 * derive the private key so signatures
 * can be made.
 */
export declare class Address {
    private readonly _address;
    private readonly _accountId;
    private readonly _keyId;
    private readonly _predicate;
    constructor(obj: IAddress);
    /**
     * The public address (like 0x58c1...)
     * @return number
     */
    readonly address: string;
    /**
     * The accountId part of the HD-key path
     * @return number
     */
    readonly accountId: number;
    /**
     * The keyId part of the HD-key path
     * @return number
     */
    readonly keyId: number;
    /**
     * The purpose for this address
     * @return string
     */
    readonly predicate: string;
    /**
     * Converts an Address object to a json string
     * @return object
     */
    toJSON(): object;
}

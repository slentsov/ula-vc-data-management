import { EventHandler, Message, Plugin } from 'universal-ledger-agent';
import { VCRepository } from './interface/vc-repository';
import { AddressRepository } from './repository/address-repository';
import { VCTransactionRepository } from './interface/vc-transaction-repository';
export declare class VcDataManagement implements Plugin {
    private _verifiableCredentialRepo;
    private _addressRepo;
    private _vcTransactionRepo;
    private _eventHandler?;
    private readonly _listeningToTypes;
    constructor(_verifiableCredentialRepo: VCRepository, _addressRepo: AddressRepository, _vcTransactionRepo: VCTransactionRepository);
    readonly name: string;
    initialize(eventHandler: EventHandler): void;
    handleEvent(message: Message, callback: any): Promise<string>;
    /**
     * Will extract attestor information from the
     * given VerifiableCredential.
     *
     * @param {VerifiableCredential} vc
     * @return {Attestor}
     */
    private extractAttestorFromVerifiableCredential;
    /**
     * Takes an array of VerifiableCredential
     * objects and maps them to the Attestor
     * data model so it can be displayed to
     * the holder.
     *
     * @todo: Switch attestorPubKey to credential.issuer after ChallengeRequest contains the issuer DID as well
     * @param {VerifiableCredential} credential
     * @return {Attestation}
     */
    private transformCredentialToIAttestation;
    /**
     * Transforms CredentialSubjects to
     * statements by leaving out the 'id'
     * field and only using the predicate
     * without the entire URL,
     * so 'http://schema.org/test/fullName'
     * will become 'fullName'.
     *
     * @param credentialSubject
     * @return {any}
     */
    private transformCredentialSubjectsToStatements;
    /**
     * Transforms VC Transactions to ULA Transactions
     *
     * @param vcTransactions
     * @return {Transaction[]}
     */
    private transformVcTransactionsToTransactions;
}

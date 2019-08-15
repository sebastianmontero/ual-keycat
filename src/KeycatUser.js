import { User, UALError, UALErrorType } from 'universal-authenticator-library';

class KeycatUser extends User {
    constructor({
        accountName,
        permission,
        publicKey,
        chainId,
        keycat,
    }) {
        super();
        this.keys = [publicKey];
        this.accountName = accountName;
        this.permission = permission;
        this.chainId = chainId;
        this.keycat = keycat;
    }

    /**
    * @param transaction  The transaction to be signed (a object that matches the RpcAPI structure).
    */
    async signTransaction(transaction, { broadcast = true, blocksBehind = 3, expireSeconds = 30 }) {
        try {
            await this.keycat
                .account(this.accountName)
                .transact(transaction, {
                    broadcast,
                    blocksBehind,
                    expireSeconds,
                });
        } catch (err) {
            throw new UALError('Error signing transaction', UALErrorType.Signing, err);
        }
    }

    /**
     * @param publicKey   The public key to use for signing.
     * @param data        The data to be signed.
     * @param helpText    Help text to explain the need for arbitrary data to be signed.
     *
     * @returns           The signature
     */
    async signArbitrary(publicKey, data) {
        try {
            return await this.keycat
                .account(this.accountName)
                .signArbitraryData(data);
        } catch (err) {
            throw new UALError('Error signing arbitrary data', UALErrorType.Signing, err);
        }
    }

    /**
     * @param challenge   Challenge text sent to the authenticator.
     *
     * @returns           Whether the user owns the private keys corresponding with provided public keys.
     */
    async verifyKeyOwnership() {
        return true;
    }

    async getAccountName() {
        return this.accountName;
    }

    async getChainId() {
        return this.chainId;
    }

    async getKeys() {
        return this.keys;
    }
}

export default KeycatUser;

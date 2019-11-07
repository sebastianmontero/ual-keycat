import { Authenticator, UALError, UALErrorType } from 'universal-authenticator-library';
import { Keycat } from '@smontero/keycatjs';
import KeycatLogo from './KeycatLogo';
import KeycatUser from './KeycatUser';

const chainMap = {
    'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473': 'eos-jungle',
    'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906': 'eos',
    '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11': 'telos',
};

class KeycatAuthenticator extends Authenticator {
    constructor(chains, options) {
        super(chains, options);
        const opts = options || {};
        let { selectedChainId } = opts;
        selectedChainId = selectedChainId || chains[0].chainId;
        this.keycatMap = this._getKeycatMap(chains);
        this.selectedChainId = selectedChainId;
        this.keycat = this.keycatMap[selectedChainId];
    }

    _getKeycatMap(chains) {
        const keycatMap = {};
        for (const chain of chains) {
            const { chainId, rpcEndpoints } = chain;
            const name = chainMap[chainId];
            if (name) {
                const nodes = [];
                for (const rpcEndpoint of rpcEndpoints) {
                    const { protocol, host, port } = rpcEndpoint;
                    nodes.push(`${protocol}://${host}:${port}`);
                }
                keycatMap[chainId] = new Keycat({
                    blockchain: {
                        name,
                        nodes,
                    },
                });
            }
        }
        return keycatMap;
    }

    async init() {
        this.keycatIsLoading = false;
        this.keycatError = null;
    }

    /**
     * Resets the authenticator to its initial, default state then calls init method
     */
    reset() {
        this.init();
    }

    /**
     * Returns true if the authenticator has errored while initializing.
     */
    isErrored() {
        return !!this.keycatError;
    }

    /**
     * Returns a URL where the user can download and install the underlying authenticator
     * if it is not found by the UAL Authenticator.
     */
    getOnboardingLink() {
        return 'https://keycatdev.gitbook.io/keycatjs/';
    }

    /**
     * Returns error (if available) if the authenticator has errored while initializing.
     */
    getError() {
        return this.keycatError;
    }

    /**
     * Returns true if the authenticator is loading while initializing its internal state.
     */
    isLoading() {
        return this.keycatIsLoading;
    }
    /**
     * Returns the style of the Button that will be rendered.
     */

    getStyle() {
        return {
            // An icon displayed to app users when selecting their authentication method 
            icon: KeycatLogo,
            // Name displayed to app users
            text: 'Keycat',
            // Background color displayed to app users who select your authenticator
            background: '#000000',
            // Color of text used on top the `backgound` property above
            textColor: '#FFFFFF',
        };
    }

    /**
     * Returns whether or not the button should render based on the operating environment and other factors.
     * ie. If your Authenticator App does not support mobile, it returns false when running in a mobile browser.
     */
    shouldRender() {
        return true;
    }

    /**
     * Returns whether or not the dapp should attempt to auto login with the Authenticator app.
     * Auto login will only occur when there is only one Authenticator that returns shouldRender() true and
     * shouldAutoLogin() true.
     */
    shouldAutoLogin() {
        return false;
    }

    /**
     * Returns whether or not the button should show an account name input field.
     * This is for Authenticators that do not have a concept of account names.
     */
    async shouldRequestAccountName() {
        return false;
    }

    /**
     * Login using the Authenticator App. This can return one or more users depending on multiple chain support.
     *
     * @param accountName  The account name of the user for Authenticators that do not store accounts (optional)
     */
    async login() {
        try {
            const { accountName, permission, publicKey } = await this.keycat.signin();
            return [
                new KeycatUser({
                    accountName,
                    permission,
                    publicKey,
                    keycat: this.keycat,
                    chainId: this.selectedChainId,

                }),
            ];
        } catch (err) {
            throw new UALError(err.messsage, UALErrorType.Login, err);
        }
    }

    /**
     * Logs the user out of the dapp. This will be strongly dependent on each 
     * Authenticator app's patterns.
     */
    async logout() {
        return true;
    }

    /**
     * Returns true if user confirmation is required for `getKeys`
     */
    requiresGetKeyConfirmation() {
        return false;
    }
}

export default KeycatAuthenticator;

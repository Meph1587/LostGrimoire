import {NetworksUserConfig} from 'hardhat/types';
import {EtherscanConfig} from '@nomiclabs/hardhat-etherscan/dist/src/types';
import * as dotenv from 'dotenv'

dotenv.config();

const defaultAccount = {
    mnemonic: "test test test test test test test test test test test junk",
    initialIndex: 0,
    path: "m/44'/60'/0'/0",
    count: 20,
    accountsBalance: "10000000000000000000000"
}


const rinkebyAccount = [process.env.PRIVATE_KEY];
const mainnetAccount = [process.env.PRIVATE_KEY];

export const networks: NetworksUserConfig = {
    // Needed for `solidity-coverage`
    coverage: {
        url: 'http://localhost:8555',
        gas: 'auto',
        hardfork: 'london', 
        initialBaseFeePerGas: 1,
        gasPrice: 2,
    },

    ganache: {
        url: 'http://localhost:7545',
        chainId: 5777,
        accounts: defaultAccount,
        gas: 'auto',
        gasPrice: 20000000000, // 1 gwei
        gasMultiplier: 1.5,
    },

    rinkeby: {
        accounts: rinkebyAccount,
        gas: 'auto',
        hardfork: 'london', 
        url: process.env.RINEKBY_API,
    },

    mainnet: {
        accounts: mainnetAccount,
        gas: 'auto',
        hardfork: 'london', 
        url: process.env.MAINNET_API,
    },

    hardhat: {
        accounts: defaultAccount,
        mining: {
            auto: true
        },
        hardfork: 'london',
        initialBaseFeePerGas: 1,
        gasPrice: 2,
        forking: {
            url: process.env.RINEKBY_API,
            enabled: false
        }
    },

  
};

// Use to verify contracts on Etherscan
// https://buidler.dev/plugins/nomiclabs-buidler-etherscan.html
export const etherscan: EtherscanConfig = {
    apiKey: process.env.ETHERSCAN_API_KEY,
};

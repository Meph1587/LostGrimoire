import {DeployConfig} from "./define-0-config";

import * as deploy from "../helpers/deploy";
import {makeTreeFromTraits} from "../helpers/merkletree/makeTree";
import { getFormattedTraits } from "../helpers/get-formatted-traits";

import {
    WizardStorage,
} from "../../typechain";

export async function deployStorage(c: DeployConfig): Promise<DeployConfig> {
    console.log(`\n --- DEPLOY WIZARD STORAGE ---`);

    let tree = await makeTreeFromTraits(getFormattedTraits());
    let root = tree.getHexRoot();
    console.log(`Merkle Tree generated with root: ${root}`);

    const wizardStorage = await deploy.deployContract('WizardStorage',[root]) as WizardStorage;
    c.storage = wizardStorage;
    c.merkleTree = tree;
    console.log(`WizardStorage deployed to: ${wizardStorage.address.toLowerCase()}`);
    console.log(`\n>>> npx hardhat verify --network rinkeby 
    ${wizardStorage.address.toLowerCase()}
    ${root}
    `);
    console.log(`>>> npx hardhat verify --network mainnet 
    ${wizardStorage.address.toLowerCase()}
    ${root}
    `);

    return c;
}



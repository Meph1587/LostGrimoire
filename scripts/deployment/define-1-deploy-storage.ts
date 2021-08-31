import {DeployConfig} from "./define-0-config";

import * as deploy from "../helpers/deploy";
import {makeTreeFromTraits,makeTreeFromNames} from "../helpers/merkletree";
const wizardTraits = require("../../data/traits.json");

import {
    WizardStorage,
} from "../../typechain";

export async function deployStorage(c: DeployConfig): Promise<DeployConfig> {
    console.log(`\n --- DEPLOY WIZARD STORAGE ---`);

    let traitsTree = await makeTreeFromTraits(wizardTraits.traits);
    let traitsTreeRoot = traitsTree.getHexRoot();
    console.log(`Merkle Tree for Traits generated with root: ${traitsTreeRoot}`);


    let namesTree = await makeTreeFromNames(wizardTraits.names);
    let namesTreeRoot = namesTree.getHexRoot();
    console.log(`Merkle Tree for Names generated with root: ${namesTreeRoot}`);

    const wizardStorage = await deploy.deployContract('WizardStorage',[traitsTreeRoot, namesTreeRoot]) as WizardStorage;
    c.storage = wizardStorage;
    c.merkleTreeTraits = traitsTree;
    c.merkleTreeNames = namesTree;
    console.log(`WizardStorage deployed to: ${wizardStorage.address.toLowerCase()}`);
    console.log(`\n>>> npx hardhat verify --network rinkeby ${wizardStorage.address.toLowerCase()} ${traitsTreeRoot}`);
    console.log(`>>> npx hardhat verify --network mainnet ${wizardStorage.address.toLowerCase()}${traitsTreeRoot}`);

    return c;
}



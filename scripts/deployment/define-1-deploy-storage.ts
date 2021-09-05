import {DeployConfig} from "./define-0-config";

import * as deploy from "../helpers/deploy";
import {makeTreeFromTraits,makeTreeFromNames} from "../helpers/merkletree";
const wizardTraits = require("../../data/traits.json");

import {
    ForgottenGrimoire,
} from "../../typechain";

export async function deployStorage(c: DeployConfig): Promise<DeployConfig> {
    console.log(`\n --- DEPLOY FORGOTTEN GRIMOIRE ---`);

    let traitsTree = await makeTreeFromTraits(wizardTraits.traits);
    let traitsTreeRoot = traitsTree.getHexRoot();
    console.log(`Merkle Tree for Traits generated with root: ${traitsTreeRoot}`);


    let namesTree = await makeTreeFromNames(wizardTraits.names);
    let namesTreeRoot = namesTree.getHexRoot();
    console.log(`Merkle Tree for Names generated with root: ${namesTreeRoot}`);

    const forgottenGrimoire = await deploy.deployContract('ForgottenGrimoire',[traitsTreeRoot, namesTreeRoot]) as ForgottenGrimoire;
    c.storage = forgottenGrimoire;
    c.merkleTreeTraits = traitsTree;
    c.merkleTreeNames = namesTree;
    console.log(`ForgottenGrimoire deployed to: ${forgottenGrimoire.address.toLowerCase()}`);
    console.log(`\n>>> npx hardhat verify --network rinkeby ${forgottenGrimoire.address.toLowerCase()} ${traitsTreeRoot} ${namesTreeRoot}`);
    console.log(`>>> npx hardhat verify --network mainnet ${forgottenGrimoire.address.toLowerCase()}${traitsTreeRoot} ${namesTreeRoot}`);

    return c;
}



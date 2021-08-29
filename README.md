# WizardStorage

_May the wizards forever be stored on the Ether!_

## Introduction

This is a storage contract for the traits and affinities of _Forgotten Runes Wizard Cult_ wizards.

The contract exposes the `storeWizardTraits()` method that can be called by anyone to submit the traits of a wizard. Traits are verified through a Merkle Tree generated from a byte-encoded list of traits.  
The Merkle Tree is constructed with the data files in `./data` which where generated based on the [runebot wizard-summary](https://github.com/ajcrowe/runebot/blob/master/src/wizard-summary.json)  
Find encoding and merkle tree generation in `./scripts/helpers/merkletree`.

## Public Read Endpoints

The contract gives four main endpoints to query traits and affinities for wizards:

`getWizardTraits(uint256 wizardId) public view returns (uint16,uint16,uint16,uint16,uint16,uint16)`

`getTraitAffinities(uint16 traitId) public view returns (uint16[] memory)`

`getAffinityOccurrences(uint16 affinityId) public view returns (uint16)`

`getWizardAffinities(uint16 wizardId) public view returns (uint16[] memory)`

## Commands

Set environment variables in a new `.env` file

Install dependencies  
`npm install`

Run tests  
`yarn test`

Run local deployment  
`yarn deploy`

Run rinkeby deployment (see comments in `./scripts/run_deploy.ts`)  
`yarn deploy --network rinkeby`

Run mainnet deployment (see comments in `./scripts/run_deploy.ts`)  
`yarn deploy --network mainnet`

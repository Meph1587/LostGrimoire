const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const wizardTraits = require("../../data/traits");
import { ethers } from 'hardhat';

// Flat version for easier import

export function getProofForTraits(traitsToProve:number[]){
    let tree = makeTreeFromTraits(wizardTraits.traits)

    const leaf = keccak256(encode(traitsToProve))
    const proof = tree.getHexProof(leaf, keccak256, { hashLeaves: true, sortPairs: true })
    return proof
}

export function proofTraits(tree:any, traitsToProve:number[]){

    const leaf = keccak256(encode(traitsToProve))
    const proof = tree.getHexProof(leaf, keccak256, { hashLeaves: true, sortPairs: true })
    return proof
}

export function getProofForName(name:string[]){
    let tree = makeTreeFromNames(wizardTraits.names)
    
    let coder = new ethers.utils.AbiCoder();
    const leaf = keccak256(coder.encode([ "uint256", "string memory" ], [ parseInt(name[0]),  name[1]]))
    const proof = tree.getHexProof(leaf, keccak256, { hashLeaves: true, sortPairs: true })
    return proof
}


export function proofName(tree:any, name:string[]){
    
    let coder = new ethers.utils.AbiCoder();
    const leaf = keccak256(coder.encode([ "uint256", "string memory" ], [ parseInt(name[0]),  name[1]]))
    const proof = tree.getHexProof(leaf, keccak256, { hashLeaves: true, sortPairs: true })
    return proof
}


function encode(traits: number[]): any{
    let encoded = "0x0000"
    traits.forEach(element => {
        let trait = element.toString(16);
        let zeroes= "";
        for (let i=0; i < 4 - trait.length; i++){
            zeroes = zeroes + "0";
        }
        encoded += (zeroes + trait)
        
    });
    return encoded
}

// Encode traits and build tree
export function makeTreeFromTraits(leaves:number[][]){

    const leavesEncoded = [];
    for(let i=0 ; i< leaves.length; i++){
        leavesEncoded.push(encode(leaves[i]));
    }

    
    const tree = new MerkleTree(leavesEncoded, keccak256, { hashLeaves: true, sortPairs: true })

    return tree;
}


// Encode traits and build tree
export function makeTreeFromNames(leaves:string[][]){

    const leavesEncoded = [];
    let coder = new ethers.utils.AbiCoder();
    for(let i=0 ; i< leaves.length; i++){
        let name = leaves[i];
        leavesEncoded.push(
            coder.encode([ "uint256", "string memory" ], [ parseInt(name[0]),  name[1]])
        );
    }
    const tree = new MerkleTree(leavesEncoded, keccak256, { hashLeaves: true, sortPairs: true })
    return tree;
}
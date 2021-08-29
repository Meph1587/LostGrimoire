const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
import {encode} from "./encodeTraits";

// Encode traits and build tree
export async function makeTreeFromTraits(leaves:number[][]): Promise<any>{

    const leavesEncoded = [];
    for(let i=0 ; i< leaves.length; i++){
        leavesEncoded.push(encode(leaves[i]));
    }
    const tree = new MerkleTree(leavesEncoded, keccak256, { hashLeaves: true, sortPairs: true })

    return tree;
}
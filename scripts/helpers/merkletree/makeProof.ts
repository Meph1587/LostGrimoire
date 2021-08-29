const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
import {encode} from "./encodeTraits";

export function makeProof(tree:any, traits:number[]): any{

    const leaf = keccak256(encode(traits))
    const proof = tree.getHexProof(leaf, keccak256, { hashLeaves: true, sortPairs: true })
    return proof
}
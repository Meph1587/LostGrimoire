import {DeployConfig} from "./define-0-config";
import {makeProof} from "../helpers/merkletree/makeProof";
import { getFormattedTraits } from "../helpers/get-formatted-traits";

import {
    WizardStorage as WS,
} from "../../typechain";


const wizardsToTraits = require("../../data/wizardsToTraits.json");
const WizardStorage = require( "../../abi/WizardStorage.json")


export async function storeTraits(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as WS;
    /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            WizardStorage,
            c.ownerAcc
        ) as WS
    */


    console.log(`\n --- STORE: WIZARDS => TRAITS ---`);
    console.log(`>>>> only run this in local network for testing!`);


    let wizards: number[] = wizardsToTraits.wizards;
    let traits = getFormattedTraits();
    let proofs = [];
    traits.forEach(element => {
       proofs.push(makeProof(c.merkleTree as any, element))
    })

    for (let i=0; i < wizards.length;i++){
        await storage.storeWizardTraits(
            wizards[i],
            traits[i],
            proofs[i],
        )
        if (i%1000 == 0) {
            console.log(`WizardStorage: traits stored up to ${i}`)
        }
    };

    return c;
}



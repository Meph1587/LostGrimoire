import {DeployConfig} from "./define-0-config";
import {proofTraits, proofName} from "../helpers/merkletree";

import {
    Grimoire as FG,
} from "../../typechain";


const wizardsToTraits = require("../../data/traits.json");
//const Grimoire = require( "../../abi/Grimoire.json")


export async function storeTraits(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as FG;
    /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            Grimoire,
            c.ownerAcc
        ) as FG
    */


    console.log(`\n --- STORE: WIZARDS => TRAITS ---`);
    console.log(`>>>> only run this in local network for testing!`);


    let wizards = wizardsToTraits.wizards;
    let traits = wizardsToTraits.traits;
    let names =  wizardsToTraits.names;



    let proofsTraits = [];
    let proofsNames = [];
    traits.forEach(element => {
        proofsTraits.push(proofTraits(c.merkleTreeTraits as any, element))
    })
    names.forEach(element => {
        proofsNames.push(proofName(c.merkleTreeNames as any,element))
    })

    for (let i=0; i < wizards.length;i++){
        await storage.storeWizardTraits(
            wizards[i],
            names[i][1],
            traits[i],
            proofsNames[i],
            proofsTraits[i]
        )
        if (i%1000 == 0) {
            console.log(`Grimoire: traits stored up to ${i}`)
        }
    };

    return c;
}



import {DeployConfig} from "./define-0-config";
import {
    WizardStorage as WS,
} from "../../typechain";

const affinityToOccurrences = require("../../data/AffinityToOccurrences.json");
const traitsToAffinities = require("../../data/TraitsToAffinities.json");
const WizardStorage = require( "../../abi/WizardStorage.json")


export async function storeAffinities(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as WS;
    /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            WizardStorage,
            c.ownerAcc
        ) as WS
    */

    console.log(`\n --- STORE: AFFINITIES => OCCURRENCES ---`);

    let affinities = traitsToAffinities.affinities;
    let traits = traitsToAffinities.traits;
    
    let affinitiesGrouped = [[]]
    let occurrencesGrouped = [[]]
    for (let i=0; i < 286;i++){
        affinitiesGrouped[affinitiesGrouped.length -1].push(i)
        occurrencesGrouped[occurrencesGrouped.length -1].push(affinityToOccurrences.occurrences[i])
        if(i==100 || i==200){
            affinitiesGrouped.push([])
            occurrencesGrouped.push([])
        }
    }

    for (let i=0; i < affinitiesGrouped.length;i++){
        let tx = await storage.storeAffinityOccurrences(affinitiesGrouped[i], occurrencesGrouped[i])
        await tx.wait()
        console.log(`WizardStorage: occurrences stored on ids from: ${i*100} to ${(i*100+100)}`)
    };
        


    console.log(`\n --- STORE: TRAITS => AFFINITIES ---`);

    for (let i=0; i < traits.length;i++){
        let tx = await storage.storeTraitAffinities(traits[i], affinities[i]) 
        await tx.wait()
        console.log(`WizardStorage: affinities stored on ids from: ${i*200} to ${(i*200+200)}`)
    };

   



    return c;
}



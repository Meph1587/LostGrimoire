import {DeployConfig} from "./define-0-config";
import { splitToChunks} from "../../scripts/helpers/lists";
import {
    WizardStorage as WS,
} from "../../typechain";

const affinityToOccurrences = require("../../data/occurrence.json");
const traitsToAffinities = require("../../data/affinities.json");
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

    let traitIds = traitsToAffinities.traits;
   
    let affinities:number[][] = []
    let identity:number[][] = []
    let positive:number[][] = []
    traitsToAffinities.affinities.forEach(e =>{
        identity.push(e[0])
        positive.push(e[1])
        affinities.push(e[0].concat(e[1]))
    });
    
    //deduplicate for affinities both identity and positive
    let filteredAffinities = []
    affinities.forEach(sublist =>{
        filteredAffinities.push(sublist.filter((element, i) => i === sublist.indexOf(element)))
    })

    console.log(affinities[10])
    console.log(filteredAffinities[10])

    let traitsChunked = splitToChunks(traitIds, 50)
    let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
    let identityChunked  = splitToChunks(identity, 50)
    let positiveChunked  = splitToChunks(positive, 50)

    for (let i=0; i < traitsChunked.length;i++){
        let tx = await storage.storeTraitAffinities(
            traitsChunked[i], affinitiesChunked[i], identityChunked[i], positiveChunked[i]
        )
        await tx.wait()
        console.log(`WizardStorage: affinities stored on ids from: ${i*50} to ${(i*50+50)}`)
    };

   



    return c;
}



import {DeployConfig} from "./define-0-config";
import { splitToChunks} from "../../scripts/helpers/lists";
import {
    Grimoire as FG,
} from "../../typechain";

const traitsToAffinities = require("../../data/affinities.json");
//const Grimoire = require( "../../abi/Grimoire.json")


export async function storeAffinities(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as FG;
    /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            Grimoire,
            c.ownerAcc
        ) as FG
    */  

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

    let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
    let identityChunked  = splitToChunks(identity, 50)
    let positiveChunked  = splitToChunks(positive, 50)
    let traitsChunked = splitToChunks(traitIds, 50)

    for (let i=0; i < traitsChunked.length;i++){
        let tx = await storage.storeTraitAffinities(
            traitsChunked[i], affinitiesChunked[i], identityChunked[i], positiveChunked[i]
        )
        await tx.wait()
        console.log(`Grimoire: affinities stored on ids from: ${i*50} to ${(i*50+50)}`)
    };

   



    return c;
}



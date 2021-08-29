import {DeployConfig} from "./define-0-config";

import {
    WizardStorage as WS,
} from "../../typechain";

export async function check(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as WS;
     /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            WizardStorage,
            c.ownerAcc
        ) as WS
    */
   
    console.log(`\n -- CHECK --`);

    for (let i=0; i < 10; i++){
        let occurrence = await storage.getAffinityOccurrences(i);
        console.log(`Affinity ${i} - occurrence ${occurrence}`)
    };

    for (let i=10; i < 20; i++){
        let affinities = await storage.getTraitAffinities(i);
        console.log(`Trait ${i} - affinities ${affinities}`)
    };

    for (let i=0; i < 10; i++){
        let traitsEncoded = await storage.getWizardTraitsEncoded(i);
        console.log(`Wizard: ${i} traitsEncoded: ${traitsEncoded}`)
        let traits = await storage.getWizardTraits(i);
        console.log(`Wizard: ${i} traits: ${traits}`)
        let affinities = await storage.getWizardAffinities(i);
        console.log(`Wizard: ${i} affinities ${affinities}`)
    };
    


    return c;
}



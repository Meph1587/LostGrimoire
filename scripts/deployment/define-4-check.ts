import {DeployConfig} from "./define-0-config";

import {
    ForgottenGrimoire as FG,
} from "../../typechain";

export async function check(c: DeployConfig): Promise<DeployConfig> {
    
    let storage = c.storage as FG;
     /* --- when using network forking un-comment this and set address
        let storage = new Contract(
            "0x58681F649B52E42B113BbA5D3806757c114E3578",
            ForgottenGrimoire,
            c.ownerAcc
        ) as FG
    */
   
    console.log(`\n -- CHECK --`);

    for (let i=0; i < 10; i++){
        let occurrence = await storage.getAffinityOccurrences(i);
        console.log(`\nAffinity ${i} - occurrence ${occurrence}`)
    };

    for (let i=10; i < 20; i++){
        let affinities = await storage.getTraitAffinities(i);
        console.log(`\nTrait ${i} - affinities ${affinities}`)
        let identity = await storage.getTraitIdentityAffinities(i);
        console.log(`Trait ${i} - identity ${identity}`)
        let positive = await storage.getTraitPositiveAffinities(i);
        console.log(`Trait ${i} - positive ${positive}`)
    };

    for (let i=0; i < 10; i++){
        let name = await storage.getWizardName(i);
        console.log(`\nWizard: ${i} name: ${name}`)
        let traitsEncoded = await storage.getWizardTraitsEncoded(i);
        console.log(`Wizard: ${i} traitsEncoded: ${traitsEncoded}`)
        let traits = await storage.getWizardTraits(i);
        console.log(`Wizard: ${i} traits: ${traits}`)
        let affinities = await storage.getWizardAffinities(i);
        console.log(`Wizard: ${i} affinities ${affinities}`)
        let identity = await storage.getWizardIdentityAffinities(i);
        console.log(`Wizard: ${i} identity ${identity}`)
        let positive = await storage.getWizardPositiveAffinities(i);
        console.log(`Wizard: ${i} positive ${positive}`)
    };
    


    return c;
}



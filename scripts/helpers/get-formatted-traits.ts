import { Console } from "console";

const wizardTraits = require("../../data/WizardsToTraits.json");


// Fills all trait lists with "7777" up to 6 elements and adds wizardId
export  function getFormattedTraits(): number[][]{
    
    let wizards = wizardTraits.wizards;
    let traitsRaw = wizardTraits.traits;

    let traits = [];
    for (let i=0; i< traitsRaw.length;i++){
        let element = traitsRaw[i];
        let filledElement = element;
        for (let _ = element.length; _ < 6; _++){
            filledElement.push(7777)
        }
        traitsRaw[i] = filledElement;
        let id:number[] = [wizards[i]];
        traits.push(id.concat(filledElement))
    };
    return traits;
}
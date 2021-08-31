import { deployContract } from "../scripts/helpers/deploy";
import { expect } from "chai";
import { WizardStorage} from "../typechain";

import { splitToChunks} from "../scripts/helpers/lists";
import { makeTreeFromTraits,makeTreeFromNames} from "../scripts/helpers/merkletree";
import { getProofForTraits, getProofForName} from "../scripts/helpers/merkletree";
import { proofName, proofTraits} from "../scripts/helpers/merkletree";

const wizardsToTraits = require("../data/traits.json");
const traitsToAffinities = require("../data/affinities.json");
const affinityToOccurrences = require("../data/occurrence.json");


describe("WizardStorage", function () {
    let storage: WizardStorage;
    let wizards: number[]
    let traitsForWizards: number[][];
    let traits: number[];
    let affinitiesForTraits: number[][][];
    let occurrences: number[][][];
    let treeTraits: any;
    let treeNames: any;
    let snapshotId: any;

    beforeEach(async () => {
        traitsForWizards = wizardsToTraits.traits;
        treeTraits = await makeTreeFromTraits(traitsForWizards);
        treeNames = await makeTreeFromNames( wizardsToTraits.names);
        storage = (await deployContract('WizardStorage', [treeTraits.getHexRoot(), treeNames.getHexRoot()])) as WizardStorage;
        wizards = wizardsToTraits.wizards;

        traits = traitsToAffinities.traits;
        affinitiesForTraits = traitsToAffinities.affinities;

        occurrences = affinityToOccurrences.occurrences;
        
    });

    describe("when storing traits =>", function () {
        it("can store with valid proofs", async function () {
            let wizardId = 6725;
            let wizardTraits = [6725,0,28,110,190,332,288];
            let wizardName = ["6725", "Ghost Eater Bathsheba of the Toadstools"];

            let validProofTraits =  getProofForTraits(wizardTraits)
            let validProofName =  getProofForName(wizardName)

            await storage.storeWizardTraits(
                wizardId, 
                wizardName[1], 
                wizardTraits, 
                validProofName, 
                validProofTraits
            )

            expect(await storage.hasTraitsStored(wizardId)).to.be.true;
            let returnedTraits = await storage.getWizardTraits(wizardId)
            
            expect(returnedTraits.t0).to.be.eq(wizardTraits[1])
            expect(returnedTraits.t1).to.be.eq(wizardTraits[2])
            expect(returnedTraits.t2).to.be.eq(wizardTraits[3])
            expect(returnedTraits.t3).to.be.eq(wizardTraits[4])
            expect(returnedTraits.t4).to.be.eq(wizardTraits[5])
            expect(returnedTraits.t5).to.be.eq(wizardTraits[6])

            expect(await storage.getWizardName(wizardId)).to.be.eq(wizardName[1])
        });

        it("can not store with invalid trait proof", async function () {
            let wizardId = 6725;
            let wizardTraits = [6725,1,2,3,4,5,6]; // invalid traits for wizard
            let wizardName = ["6725", "Ghost Eater Bathsheba of the Toadstools"];
            let invalidProofTraits =  proofTraits(treeTraits, wizardTraits)
            let validProofName =  getProofForName(wizardName)

            await expect(
                storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, invalidProofTraits)
            ).to.be.revertedWith("Merkle Proof for traits is invalid!");
            
            expect(await storage.hasTraitsStored(wizardId)).to.be.false;
            
        });


        it("can not store with invalid name proof", async function () {
            let wizardId = 6725;
            let wizardTraits = [6725,0,28,110,190,332,288];
            let wizardName = ["6725", "Mephistopheles"]; //invalid name
            let validProofTraits =  getProofForTraits(wizardTraits)
            let invalidProofName =  proofName(treeNames, wizardName)

            await expect(
                storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, invalidProofName, validProofTraits)
            ).to.be.revertedWith("Merkle Proof for name is invalid!");
            
            expect(await storage.hasTraitsStored(wizardId)).to.be.false;
            
        });

        it("can not store twice", async function () {
            let wizardId = 6725;
            let wizardTraits = [6725,0,28,110,190,332,288];
            let wizardName = ["6725", "Ghost Eater Bathsheba of the Toadstools"];
            let validProofTraits =  getProofForTraits(wizardTraits)
            let validProofName =  getProofForName(wizardName)

            //ok
            await storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, validProofTraits)

            //second time nope
            await expect(
                storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, validProofTraits)
            ).to.be.revertedWith("Traits are already stored");
            
        }); 
    })

    describe("when storing affinities =>", function () {
        it("can store affinities during store period", async function () {
            let traitIds = traits;
            let affinities:number [][] = []
            let identity:number [][]  = []
            let positive:number [][]  = []
            affinitiesForTraits.forEach(e =>{
                    identity.push(e[0])
                    positive.push(e[1])
                    affinities.push(e[0].concat(e[1]))
                });
            
            let traitsChunked = splitToChunks(traitIds, 50)
            let affinitiesChunked  = splitToChunks(affinities, 50)
            let identityChunked  = splitToChunks(identity, 50)
            let positiveChunked  = splitToChunks(positive, 50)
            
            await storage.storeTraitAffinities(
                traitsChunked[0], affinitiesChunked[0], identityChunked[0], positiveChunked[0]
            )

            let result: number[] = await storage.getTraitAffinities(traitIds[0]);

            expect(result[0]).to.be.equal(affinities[0][0])
            expect(result[1]).to.be.equal(affinities[0][1])


            result = await storage.getTraitIdentityAffinities(traitIds[0]);

            expect(result[0]).to.be.equal(identity[0][0])
            expect(result[1]).to.be.equal(identity[0][1])

            result = await storage.getTraitPositiveAffinities(traitIds[0]);

            expect(result[0]).to.be.equal(positive[0][0])
            expect(result[1]).to.be.equal(positive[0][1])
        });

        it("can not store affinities after store period", async function () {
            let traitIds = traits;
            let affinities:number [][] = []
            let identity:number [][]  = []
            let positive:number [][]  = []
            affinitiesForTraits.forEach(e =>{
                    identity.push(e[0])
                    positive.push(e[1])
                    affinities.push(e[0].concat(e[1]))
                });
            
            let traitsChunked = splitToChunks(traitIds, 50)
            let affinitiesChunked  = splitToChunks(affinities, 50)
            let identityChunked  = splitToChunks(identity, 50)
            let positiveChunked  = splitToChunks(positive, 50)
            
             
            
            await storage.stopStoring();
            await expect(
                storage.storeTraitAffinities(
                    traitsChunked[0], affinitiesChunked[0], identityChunked[0], positiveChunked[0]
                )
            ).to.be.revertedWith("Storing is over");
        });
    })

    describe("when storing occurrences =>", function () {
        it("can store occurrences during store period", async function () {
            let affinitiesId = [0,1,2,3,4,5];
            let affinityOccurrences = [372, 119, 122, 313, 198, 118];

            await storage.storeAffinityOccurrences(affinitiesId, affinityOccurrences)


            expect( await storage.getAffinityOccurrences(0)).to.be.equal(affinityOccurrences[0])
            expect( await storage.getAffinityOccurrences(1)).to.be.equal(affinityOccurrences[1])
            expect( await storage.getAffinityOccurrences(2)).to.be.equal(affinityOccurrences[2])
            expect( await storage.getAffinityOccurrences(3)).to.be.equal(affinityOccurrences[3])
            expect( await storage.getAffinityOccurrences(4)).to.be.equal(affinityOccurrences[4])
        });

        it("can not store occurrences after store period", async function () {
            let affinitiesId = [0,1,2,3,4,5];
            let affinityOccurrences = [372, 119, 122, 313, 198, 118];

            await storage.stopStoring();
            await expect(
                storage.storeAffinityOccurrences(affinitiesId, affinityOccurrences)
            ).to.be.reverted;
        });
    })

});



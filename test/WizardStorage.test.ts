import { deployContract } from "../scripts/helpers/deploy";
import { expect } from "chai";
import { WizardStorage} from "../typechain";

import { getFormattedTraits } from "../scripts/helpers/get-formatted-traits";
import { makeTreeFromTraits} from "../scripts/helpers/merkletree/makeTree";
import { makeProof} from "../scripts/helpers/merkletree/makeProof";

const wizardsToTraits = require("../data/wizardsToTraits.json");
const traitsToAffinities = require("../data/traitsToAffinities.json");
const affinityToOccurrences = require("../data/affinityToOccurrences.json");


describe("WizardStorage", function () {
    let storage: WizardStorage;
    let wizards: number[]
    let traitsForWizards: number[][];
    let traits: number[][];
    let affinitiesForTraits: number[][][];
    let occurrences: number[][][];
    let tree: any;
    let snapshotId: any;

    beforeEach(async () => {
        traitsForWizards = getFormattedTraits();
        tree = await makeTreeFromTraits(traitsForWizards);
        storage = (await deployContract('WizardStorage', [tree.getHexRoot()])) as WizardStorage;
        wizards = wizardsToTraits.wizards;

        traits = traitsToAffinities.traits;
        affinitiesForTraits = traitsToAffinities.affinities;

        occurrences = affinityToOccurrences.occurrences;
        
    });

    describe("when storing traits =>", function () {
        it("can store with valid proof", async function () {
            let wizardId = wizards[0];
            let wizardTraits = traitsForWizards[0];
            let validProof =  makeProof(tree, wizardTraits)

            await storage.storeWizardTraits(wizardId, wizardTraits, validProof)

            expect(await storage.hasTraitsStored(wizardId)).to.be.true;
            let returnedTraits = await storage.getWizardTraits(wizardId)
            
            expect(returnedTraits.t0).to.be.eq(wizardTraits[1])
            expect(returnedTraits.t1).to.be.eq(wizardTraits[2])
            expect(returnedTraits.t2).to.be.eq(wizardTraits[3])
            expect(returnedTraits.t3).to.be.eq(wizardTraits[4])
            expect(returnedTraits.t4).to.be.eq(wizardTraits[5])
            expect(returnedTraits.t5).to.be.eq(wizardTraits[6])
        });

        it("can not store with invalid proof", async function () {
            let wizardId = wizards[0];
            let wizardTraits = [wizards[0], 1,2,3,4,5,6]; // invalid traits for wizard
            let invalidProof =  makeProof(tree, wizardTraits)

            await expect(
                storage.storeWizardTraits(wizardId, wizardTraits, invalidProof)
            ).to.be.revertedWith("Merkle Proof Invalid!");
            
            expect(await storage.hasTraitsStored(wizardId)).to.be.false;
            
        });

        it("can not store twice", async function () {
            let wizardId = wizards[0];
            let wizardTraits = traitsForWizards[0];
            let validProof =  makeProof(tree, wizardTraits)

            //ok
            await storage.storeWizardTraits(wizardId, wizardTraits, validProof)

            //second time nope
            await expect(storage.storeWizardTraits(wizardId, wizardTraits, validProof)).to.be.reverted;
            
        }); 
    })

    describe("when storing affinities =>", function () {
        it("can store affinities during store period", async function () {
            let traitIds = traits[0];
            let affinities = affinitiesForTraits[0];

            await storage.storeTraitAffinities(traitIds, affinities)

            let result: number[] = await storage.getTraitAffinities(traitIds[0]);

            expect(result[0]).to.be.equal(affinities[0][0])
            expect(result[1]).to.be.equal(affinities[0][1])
        });

        it("can not store affinities after store period", async function () {
            let traitIds = traits[0];
            let affinities = affinitiesForTraits[0];
            await storage.stopStoring();
            await expect(storage.storeTraitAffinities(traitIds, affinities)).to.be.reverted;
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

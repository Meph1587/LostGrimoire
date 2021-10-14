import { deployContract } from "../scripts/helpers/deploy";
import { expect } from "chai";
import { Grimoire} from "../typechain";

import { splitToChunks} from "../scripts/helpers/lists";
import { makeTreeFromTraits,makeTreeFromNames} from "../scripts/helpers/merkletree";
import { getProofForTraits, getProofForName} from "../scripts/helpers/merkletree";
import { proofName, proofTraits} from "../scripts/helpers/merkletree";

import { ethers } from 'hardhat';

const wizardsToTraits = require("../data/traits.json");
const traitsToAffinities = require("../data/affinities.json");


describe("Grimoire", function () {
    let storage: Grimoire;
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
        storage = (await deployContract('Grimoire', [treeTraits.getHexRoot(), treeNames.getHexRoot()])) as Grimoire;
        wizards = wizardsToTraits.wizards;

        traits = traitsToAffinities.traits;
        affinitiesForTraits = traitsToAffinities.affinities;

        
    });

    describe("when reading constants =>", function () {
        it("returns correct trait names", async function () {
            expect(await storage.getTraitName(0)).to.be.eq("Black")
            expect(await storage.getTraitName(1)).to.be.eq("Blue")
            expect(await storage.getTraitName(20)).to.be.eq("Purple Caped Traveller")
            expect(await storage.getTraitName(340)).to.be.eq("Garnet Staff")
        });

        it("returns correct affinity names", async function () {
            expect(await storage.getAffinityName(0)).to.be.eq("Academic")
            expect(await storage.getAffinityName(152)).to.be.eq("Faustian")
            expect(await storage.getAffinityName(285)).to.be.eq("Astral Arcanist")
        });


        it("returns correct affinity occurrences", async function () {
            let affinityOccurrences = [372, 119, 122, 313, 198, 118];


            expect( await storage.getAffinityOccurrences(0)).to.be.equal(affinityOccurrences[0])
            expect( await storage.getAffinityOccurrences(1)).to.be.equal(affinityOccurrences[1])
            expect( await storage.getAffinityOccurrences(2)).to.be.equal(affinityOccurrences[2])
            expect( await storage.getAffinityOccurrences(3)).to.be.equal(affinityOccurrences[3])
            expect( await storage.getAffinityOccurrences(4)).to.be.equal(affinityOccurrences[4])
        });

        it("returns correct trait occurrences", async function () {
            let affinityOccurrences = [3719, 3155, 2085, 1041, 1, 159];
            expect( await storage.getTraitOccurrences(0)).to.be.equal(affinityOccurrences[0])
            expect( await storage.getTraitOccurrences(1)).to.be.equal(affinityOccurrences[1])
            expect( await storage.getTraitOccurrences(2)).to.be.equal(affinityOccurrences[2])
            expect( await storage.getTraitOccurrences(3)).to.be.equal(affinityOccurrences[3])
            expect( await storage.getTraitOccurrences(4)).to.be.equal(affinityOccurrences[4])
            expect( await storage.getTraitOccurrences(5)).to.be.equal(affinityOccurrences[5])
        });
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
        
            let returnedTraits = await storage.getWizardTraits(wizardId)
            
            expect(returnedTraits.t0).to.be.eq(wizardTraits[1])
            expect(returnedTraits.t1).to.be.eq(wizardTraits[2])
            expect(returnedTraits.t2).to.be.eq(wizardTraits[3])
            expect(returnedTraits.t3).to.be.eq(wizardTraits[4])
            expect(returnedTraits.t4).to.be.eq(wizardTraits[5])
            expect(returnedTraits.t5).to.be.eq(wizardTraits[6])

            expect(await storage.getWizardName(wizardId)).to.be.eq(wizardName[1])

            expect(await storage.getWizardTraitsEncoded(wizardId)).to.be.eq("0x00001a450000001c006e00be014c0120");

            expect(await storage.getWizardHasTrait(wizardId, 28)).to.be.true;
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

        it("can not store if submitted data is invalid", async function () {
            let wizardId = 6725;
            let wizardTraits = [6725,0,28,110,190,332];//last one missing
            let wizardName = ["6725", "Ghost Eater Bathsheba of the Toadstools"];
            let validProofTraits =  getProofForTraits(wizardTraits)
            let validProofName =  getProofForName(wizardName)

            //invalid trait length
            await expect(
                storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, validProofTraits)
            ).to.be.revertedWith("Invalid Length");

            wizardTraits = [7777,0,28,110,190,332,288];

             //invalid wizard id in traits
             await expect(
                storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, validProofTraits)
            ).to.be.revertedWith("WizardsId to Trait mismatch");
            
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
           //deduplicate for affinities both identity and positive
            let filteredAffinities = []
            affinities.forEach(sublist =>{
                filteredAffinities.push(sublist.filter((element, i) => i === sublist.indexOf(element)))
            }) 
            let traitsChunked = splitToChunks(traitIds, 50)
            let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
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
           //deduplicate for affinities both identity and positive
            let filteredAffinities = []
            affinities.forEach(sublist =>{
                filteredAffinities.push(sublist.filter((element, i) => i === sublist.indexOf(element)))
            }) 
            let traitsChunked = splitToChunks(traitIds, 50)
            let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
            let identityChunked  = splitToChunks(identity, 50)
            let positiveChunked  = splitToChunks(positive, 50)
            
             
            
            await storage.stopStoring();
            await expect(
                storage.storeTraitAffinities(
                    traitsChunked[0], affinitiesChunked[0], identityChunked[0], positiveChunked[0]
                )
            ).to.be.revertedWith("Storing is over");
        });

        it("can not store affinities as other user", async function () {
            let traitIds = traits;
            let affinities:number [][] = []
            let identity:number [][]  = []
            let positive:number [][]  = []
            affinitiesForTraits.forEach(e =>{
                    identity.push(e[0])
                    positive.push(e[1])
                    affinities.push(e[0].concat(e[1]))
                });
           //deduplicate for affinities both identity and positive
            let filteredAffinities = []
            affinities.forEach(sublist =>{
                filteredAffinities.push(sublist.filter((element, i) => i === sublist.indexOf(element)))
            }) 
            let traitsChunked = splitToChunks(traitIds, 50)
            let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
            let identityChunked  = splitToChunks(identity, 50)
            let positiveChunked  = splitToChunks(positive, 50)
            
            let otherUser = (await ethers.getSigners())[1];
            await expect(
                storage.connect(otherUser).storeTraitAffinities(
                    traitsChunked[0], affinitiesChunked[0], identityChunked[0], positiveChunked[0]
                )
            ).to.be.revertedWith("Not Storage Master");

            await expect(
                storage.connect(otherUser).stopStoring()
            ).to.be.revertedWith("Not Storage Master");
        });
    })

    describe("view checks", function () {

        beforeEach(async () =>{
            let traitIds = traits;
            let affinities:number [][] = []
            let identity:number [][]  = []
            let positive:number [][]  = []
            affinitiesForTraits.forEach(e =>{
                    identity.push(e[0])
                    positive.push(e[1])
                    affinities.push(e[0].concat(e[1]))
                });

           //deduplicate for affinities both identity and positive
            let filteredAffinities = []
            affinities.forEach(sublist =>{
                filteredAffinities.push(sublist.filter((element, i) => i === sublist.indexOf(element)))
            }) 

            let traitsChunked = splitToChunks(traits, 50)
            let affinitiesChunked  = splitToChunks(filteredAffinities, 50)
            let identityChunked  = splitToChunks(identity, 50)
            let positiveChunked  = splitToChunks(positive, 50)

            traitsChunked.forEach(async (e,i) => {
                await storage.storeTraitAffinities(
                    traitsChunked[i], affinitiesChunked[i], identityChunked[i], positiveChunked[i]
                ) 
            });
            

            let wizardId = 6725;
            let wizardTraits = [6725,0,28,110,190,332,288];
            let wizardName = ["6725", "Ghost Eater Bathsheba of the Toadstools"];
            let validProofTraits =  getProofForTraits(wizardTraits)
            let validProofName =  getProofForName(wizardName)

            //ok
            await storage.storeWizardTraits(wizardId, wizardName[1], wizardTraits, validProofName, validProofTraits)

        });


        it("all affinity count read methods return correct", async function () {
            
            expect( await storage.getWizardAffintyCount(6725,174)).to.be.eq(2)
            expect( await storage.getWizardAffintyCount(6725,106)).to.be.eq(1)
            expect( await storage.getWizardAffintyCount(6725,100)).to.be.eq(0)


            expect( await storage.getWizardIdentityAffintyCount(6725,88)).to.be.eq(1)
            expect( await storage.getWizardIdentityAffintyCount(6725,107)).to.be.eq(1)
            expect( await storage.getWizardIdentityAffintyCount(6725,100)).to.be.eq(0)


            expect( await storage.getWizardPositiveAffintyCount(6725,201)).to.be.eq(2)
            expect( await storage.getWizardPositiveAffintyCount(6725,174)).to.be.eq(2)
            expect( await storage.getWizardPositiveAffintyCount(6725,100)).to.be.eq(0)
                                                                             
            expect((await storage.getWizardIdentityAffinities(6725)).toString()).to.be.eq("82,25,174,106,199,25,153,88,107,201,174,234,161,13,196,282,210,89")
            expect((await storage.getWizardPositiveAffinities(6725)).toString()).to.be.eq("82,25,174,106,50,25,215,170,243,107,201,174,13,161,56,196,282,201")


            expect( await storage.getWizardHasTrait(6725,100)).to.be.false
            
        });
                
    }); 

});



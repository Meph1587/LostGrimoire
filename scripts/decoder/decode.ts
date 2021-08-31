// BASED ON https://gist.github.com/cryppadotta/375dee1903598f5163e2c1d7d3ce9db9
// 
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@///////////////********@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///,,,,@@@@@@@&,,,,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///,,,,@@@@@@@&,,,,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///@@@@@@@@@@@@@@@,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&,,,@@@@@@@@@@@@@@@,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&,,,@@@@@@@@@@@@@@@,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&,,,@@@@@@@@@@@@@@@,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&,,,*///@@@@@@@&///,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&,,,*///@@@@@@@&///,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&//////////////////,,,,,,,,***/@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,,,,,,,,,,,,,*******@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,,,,,,,,,,,,,*******@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///////,,,,,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///********,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///********,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@////,,,,,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@////,,,,,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@////****,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///****,,,,,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@&///****,,,,,,,,***@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//
// https://forgottenrunes.com
//
// This file describes how to extract The Forgotten Runes Wizards from on-chain
// data.  The direct use of this file depends on the continued existence of
// Node.js and the npm package ecosystem, however, the NFTs themselves do not.
// In that light, this document is a guide for future wizards who wish to
// unearth the magic of our age
//
// # We note the environment:
//
// npm  --version // 6.14.7
// node --version // v14.7.0
//
// # Then install the prerequisites:
//
// npm init -y
// npm install ethers@5.0.26 yargs@16.1.0 chalk@4.1.0 ora@5.3.0 \
//   ts-node@9.0.0 typescript@4.0.5 bson@4.4.0 sharp@0.28.3 \
//   parse-numeric-range@1.2.0 mkdirp@1.0.4
//
// # View the options
//
// ./node_modules/.bin/ts-node ./decoder.ts --help
//
// # Apparate Wizards
//
// ./node_modules/.bin/ts-node ./decoder.ts --wizards "0-9,13,1234"

import { JsonRpcProvider } from "@ethersproject/providers";
import { Interface } from "ethers/lib/utils";
import * as fs from "fs";
import * as ora from "ora";
import * as BSON from "bson";



const traitsPath = './data/traits.json'
const affinitiesPath = './data/affinities.json'


const runes = ["Φ", "Ψ", "λ", "ϐ", "ҩ", "Ӝ", "⊙", "⚭", "Ω"];

export async function decode() {
  const provider = new JsonRpcProvider("https://cloudflare-eth.com/");
  const spinner = ora({
    text: "Rising",
    spinner: { interval: 80, frames: runes },
    prefixText: "🧙‍♀️"
  }).start();

  const traits = await decodeTraits({ provider, spinner });

  let wizardFormat = {
    "wizards": [],
    "names": [],
    "traits": [],
  }

  for (let i = 0; i < 10000; i++) {
    wizardFormat.wizards.push(i)
    wizardFormat.names.push([i.toString()].concat(traits[i][0]))
    wizardFormat.traits.push([i].concat(traits[i].slice(1, traits[0].length)))
  }
  fs.writeFileSync(traitsPath, JSON.stringify(wizardFormat))


  let affinityFormat = {
    "traits": [],
    "affinities": []
  }

  const affinities = await decodeAffinities({provider, spinner})


  for (let i = 0; i < affinities.length; i++) {
    const traitId = affinities[i][0];
    affinityFormat.traits.push(traitId)
    affinityFormat.affinities.push(affinities[i].slice(2, affinities[0].length))
  }
  fs.writeFileSync(affinitiesPath, JSON.stringify(affinityFormat))


  spinner.color = "green";
  spinner.text = "Complete";
  spinner.succeed();
}

const abi = [
  {
    inputs: [{ internalType: "bytes", name: "s", type: "bytes" }],
    name: "uploadWizardsAttributes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes", name: "s", type: "bytes" }],
    name: "uploadWizardsImage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const provenance = {
  img: "0xbb6413bd70bae87b724c30ba9e46224fa63629709e7ccfe60a39cc14aa41013e",
  traits: [
    "0x227552b04af7606108d306654c620a655393451742e299e8bfd28236683da2cf",
    "0x529b29d36d07c917cc24bf162d737adc0c8ddc07003f9d5ca59876cf8167bfda",
    "0x8ec128ed9b3f4f92853d8df0ff6a2159963e81f2a611145f60a8d96990439049",
    "0xe6f0b0e76ddbc581ba3a8155ff545b7d5c31a394ac0a54b44aa9ea21525d0d06",
    "0x78a6304221ff044d3adcdb037be10aa843707f2c8241e81b4b2c6fbcb51f8b79",
    "0x74b9d75a174e76981f823d594c2c2fbcaff61e66a76be7977e0cbeb52c28f01f",
    "0x3500861637fce52bef4be39ae935e632881df4a69a47abcca8bbfc9490278dc6",
    "0x96677df7c85535328b16d93acf8cd925b87886ca2198c3654ff8d8cc56236f69",
    "0xa2977bf5ef9864796fe713db9e08f98fbbce129f4280651b6b9782c4ffdf4bd2",
    "0xe9ecc9dd5f0518617afb8593157dde0bc58d5d1e4fdb5f10a3ff8f96a81897dc"
  ]
};

export type WizardTraits = [
  any /* name */,
  number /* background */,
  number /* body */,
  number /* familiar */,
  number /* head */,
  number /* prop */,
  number /* rune */
];

export type Affinity = [
  number /* traitId */,
  string /* name */,
  number[] /* identity */,
  number[] /* positive */,
];

async function decodeTraits({
  provider,
  spinner
}: {
  provider: JsonRpcProvider;
  spinner: ora.Ora;
}): Promise<(WizardTraits[])> {
  spinner.start();
  let traits = [];
  for (let i = 0; i < provenance.traits.length; i++) {
    const txHash = provenance.traits[i];
    spinner.color = "blue";
    spinner.text = `Downloading ${i}/${provenance.traits.length} ${txHash}`;
    const tx = await provider.getTransaction(txHash);
    const wisdom = new Interface(abi);
    //console.log(tx)
    const parsed = wisdom.parseTransaction({
      data: tx.data
    });
    traits = traits.concat(
      Object.values(
        BSON.deserialize(Buffer.from(parsed.args.toString().slice(2), "hex"))
      )
    );
  }
  spinner.succeed(`Found the traits for all wizards`);

  return traits;
}

async function decodeAffinities({
  provider,
  spinner
}: {
  provider: JsonRpcProvider;
  spinner: ora.Ora;
}): Promise<Affinity[]> {
  const tx = await provider.getTransaction("0x1be4aa782c9dc164ecbf2cd155537e7250b344f405dff03b5c33fdd63261c80e");
  const wisdom = new Interface(abi);
  //console.log(tx)
  const parsed = wisdom.parseTransaction({
    data: tx.data
  });
  let affinities = Object.values(
      BSON.deserialize(Buffer.from(parsed.args.toString().slice(2), "hex"))
  );
  spinner.succeed(`Found the affinities for all wizards`);

  return  affinities;
}


decode()
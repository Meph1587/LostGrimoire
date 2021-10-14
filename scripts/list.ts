let affinity_list = require("../data/affinityNames.json")
let traits_list = require("../data/traits.json")

export async function lineUpNames() {

    let map = new Map();
    affinity_list.forEach(traits => {
        traits.affinity.forEach( aff => {
            map.set(parseInt(aff.idx), aff.name);
        });
        traits.tags.forEach( aff => {
            map.set(parseInt(aff.idx), aff.name);
        });
    });

    let names = ""

   for(let i=0;i<290;i++){
        names = names + "-" + map.get(i)
      
   }
   console.log(names)
}

//lineUpNames()


export function getTraitOccurrences() {

    let map = new Map<number, number>();
    traits_list.traits.forEach(wiz => {
        for(let i = 1; i < 7; i++ ){
            let traitId = wiz[i];
            let occ = map.get(traitId);
            if (occ == undefined){
                occ = 1
            }else{
                occ = occ + 1
            }

            map.set(traitId, occ);
        }
    });

    let sorted  = new Map(Array.from(map.entries()).sort((a, b) => a[0] - b[0]));

   sorted.forEach(v=>{
       console.log(v)
   })
}

getTraitOccurrences()
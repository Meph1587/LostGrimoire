let affinity_list = require("../data/affinityNames.json")


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

lineUpNames()
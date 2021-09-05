export function splitToChunks(list:any[], length:number):any[][]{
    let listChunks = [[]]
    list.forEach((element, i) => {
        listChunks[listChunks.length -1].push(element)
        if(i%length==0){
            listChunks.push([])
        }
    });
    return listChunks;
}
export function splitToChunks(list:any[], length:number):any[][]{
    let listChunks = [[]]
    for (let i=0; i < list.length;i++){
        listChunks[listChunks.length -1].push(list[i])
        if(i%length==0){
            listChunks.push([])
        }
    }
    return listChunks;
}
export function encode(traits: number[]): any{
    let encoded = "0x0000"
    traits.forEach(element => {
        let trait = element.toString(16);
        let zeroes= "";
        for (let i=0; i < 4 - trait.length; i++){
            zeroes = zeroes + "0";
        }
        encoded += (zeroes + trait)
        
    });
    return encoded
}

import {getAccount, impersonateAccount} from "../helpers/accounts";
import {Signer} from "ethers";

import {
    Grimoire,
} from "../../typechain";

export async function deployConfig(owner:string): Promise<DeployConfig> {
    
    let account;
    try{
        account = await getAccount(owner)
    }catch{
        account = await impersonateAccount(owner)
    }
    return new DeployConfig(owner, account)
}

export class DeployConfig {
    public owner: string;
    public ownerAcc: Signer;
    public storage?: Grimoire;
    public merkleTreeTraits?: any;
    public merkleTreeNames?: any;
    public storageAddr: string;

    constructor(owner: string, ownerAcc: Signer)
        {
            this.owner = owner;
            this.ownerAcc = ownerAcc ;
        }
}
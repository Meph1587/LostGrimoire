
import {getAccount, impersonateAccount} from "../helpers/accounts";
import {Signer} from "ethers";

import {
    ForgottenGrimoire,
} from "../../typechain";

export async function deployConfig(owner:string): Promise<DeployConfig> {

    // For network forking use getAccount()
    //return new DeployConfig(owner, await getAccount(owner))
    return new DeployConfig(owner, await impersonateAccount(owner))
}

export class DeployConfig {
    public owner: string;
    public ownerAcc: Signer;
    public storage?: ForgottenGrimoire;
    public merkleTreeTraits?: any;
    public merkleTreeNames?: any;
    public storageAddr: string;

    constructor(owner: string, ownerAcc: Signer)
        {
            this.owner = owner;
            this.ownerAcc = ownerAcc ;
        }
}
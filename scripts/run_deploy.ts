
import {deployConfig} from "./deployment/define-0-config";
import {deployStorage} from "./deployment/define-1-deploy-storage";
import {storeAffinities} from "./deployment/define-2-store-affinities";
import {storeTraits} from "./deployment/define-3-store-traits";
import {check} from "./deployment/define-4-check";


const DEPLOYER_ADDRESS = "0x11dd5F745D665b8C10C16579189e0Ff3fE31ab02"


// comment out steps to skip
deployConfig(DEPLOYER_ADDRESS)
.then(c => deployStorage(c))
.then(c => storeAffinities(c))
.then(c => storeTraits(c)) //use this only for testing!
.then(c => check(c)) //use this only for testing!
.catch(error => {
    console.error(error);
    process.exit(1);
});



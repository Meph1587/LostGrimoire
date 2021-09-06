//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract Grimoire {
    mapping(uint256 => bool) public hasTraitsStored;

    bool private canStoreAffinities = true;
    bytes32 public merkleRootTraitsTree;
    bytes32 public merkleRootNamesTree;
    mapping(uint256 => bytes) private wizardToTraits;
    mapping(uint256 => string) private wizardToName;
    mapping(uint16 => uint16[]) private traitsToAffinities;
    mapping(uint16 => uint16[]) private traitsToIdentity;
    mapping(uint16 => uint16[]) private traitsToPositive;
    mapping(uint16 => uint16) private affinityOccurrences;

    event StoredTrait(uint256 wizardId, string name, bytes encodedTraits);

    constructor(bytes32 _rootTraits, bytes32 _rootNames) {
        merkleRootTraitsTree = _rootTraits;
        merkleRootNamesTree = _rootNames;
    }

    // Store traits for a list of Wizards
    function storeWizardTraits(
        uint256 wizardId,
        string calldata name,
        uint16[] calldata traits,
        bytes32[] calldata proofsName,
        bytes32[] calldata proofsTraits
    ) public {
        require(traits.length == 7, "Invalid Length");
        require(traits[0] == wizardId, "WizardsId to Trait mismatch");
        require(!hasTraitsStored[wizardId], "Traits are already stored");

        require(
            _verifyName(proofsName, wizardId, name),
            "Merkle Proof for name is invalid!"
        );

        bytes memory encodedTraits = _encode(
            traits[0],
            traits[1],
            traits[2],
            traits[3],
            traits[4],
            traits[5],
            traits[6]
        );
        require(
            _verifyEncodedTraits(proofsTraits, encodedTraits),
            "Merkle Proof for traits is invalid!"
        );

        wizardToName[wizardId] = name;
        wizardToTraits[wizardId] = encodedTraits;
        hasTraitsStored[wizardId] = true;

        emit StoredTrait(wizardId, name, encodedTraits);
    }

    // Store related affinities for a list of traits
    function storeTraitAffinities(
        uint16[] calldata traits,
        uint16[][] calldata affinities,
        uint16[][] calldata identity,
        uint16[][] calldata positive
    ) public {
        require(canStoreAffinities, "Storing is over");
        for (uint256 i = 0; i < traits.length; i++) {
            traitsToAffinities[traits[i]] = affinities[i];
            traitsToIdentity[traits[i]] = identity[i];
            traitsToPositive[traits[i]] = positive[i];
        }
    }

    // Store affinity occurrences for alist of affinities
    function storeAffinityOccurrences(
        uint16[] calldata affinities,
        uint16[] calldata occurrences
    ) public {
        require(canStoreAffinities, "Storing is over");
        for (uint256 i = 0; i < affinities.length; i++) {
            affinityOccurrences[affinities[i]] = occurrences[i];
        }
    }

    function stopStoring() public {
        require(canStoreAffinities, "Store is already over");
        canStoreAffinities = false;
    }

    /**
        VIEWS
     */

    function getWizardTraits(uint256 wizardId)
        public
        view
        returns (
            uint16 t0,
            uint16 t1,
            uint16 t2,
            uint16 t3,
            uint16 t4,
            uint16 t5
        )
    {
        //ignore id
        (, t0, t1, t2, t3, t4, t5) = _decode(wizardToTraits[wizardId]);
    }

    function getTraitAffinities(uint16 traitId)
        public
        view
        returns (uint16[] memory)
    {
        return traitsToAffinities[traitId];
    }

    function getTraitIdentityAffinities(uint16 traitId)
        public
        view
        returns (uint16[] memory)
    {
        return traitsToIdentity[traitId];
    }

    function getTraitPositiveAffinities(uint16 traitId)
        public
        view
        returns (uint16[] memory)
    {
        return traitsToPositive[traitId];
    }

    function getAffinityOccurrences(uint16 id) public view returns (uint16) {
        return affinityOccurrences[id];
    }

    function getWizardName(uint256 wizardId)
        public
        view
        returns (string memory)
    {
        return wizardToName[wizardId];
    }

    function wizardAffintyCount(uint256 wizardId, uint16 affinity)
        public
        view
        returns (uint256 affinityCount)
    {
        uint16[] memory wizAffinities = getWizardAffinities(wizardId);
        // count how many times selected wizard has affinity
        affinityCount = 0;
        for (uint8 i = 0; i < wizAffinities.length; i++) {
            if (wizAffinities[i] == affinity) {
                affinityCount += 1;
            }
        }
    }

    function wizardIdentityAffintyCount(uint256 wizardId, uint16 affinity)
        public
        view
        returns (uint256 affinityCount)
    {
        uint16[] memory wizAffinities = getWizardIdentityAffinities(wizardId);
        // count how many times selected wizard has affinity
        affinityCount = 0;
        for (uint8 i = 0; i < wizAffinities.length; i++) {
            if (wizAffinities[i] == affinity) {
                affinityCount += 1;
            }
        }
    }

    function wizardPositiveAffintyCount(uint256 wizardId, uint16 affinity)
        public
        view
        returns (uint256 affinityCount)
    {
        uint16[] memory wizAffinities = getWizardPositiveAffinities(wizardId);
        // count how many times selected wizard has affinity
        affinityCount = 0;
        for (uint8 i = 0; i < wizAffinities.length; i++) {
            if (wizAffinities[i] == affinity) {
                affinityCount += 1;
            }
        }
    }

    function wizardHasTrait(uint256 wizardId, uint16 trait)
        public
        view
        returns (bool)
    {
        (
            ,
            uint16 t0,
            uint16 t1,
            uint16 t2,
            uint16 t3,
            uint16 t4,
            uint16 t5
        ) = _decode(wizardToTraits[wizardId]);
        uint16[6] memory wizTraits = [t0, t1, t2, t3, t4, t5];

        for (uint8 i = 0; i < wizTraits.length; i++) {
            if (wizTraits[i] == trait) {
                return true;
            }
        }
        return false;
    }

    function getWizardAffinities(uint256 wizardId)
        public
        view
        returns (uint16[] memory)
    {
        // ignore id and t0 (background has no affinity)
        (, , uint16 t1, uint16 t2, uint16 t3, uint16 t4, uint16 t5) = _decode(
            wizardToTraits[wizardId]
        );

        uint16[] storage affinityT1 = traitsToAffinities[t1];
        uint16[] storage affinityT2 = traitsToAffinities[t2];
        uint16[] storage affinityT3 = traitsToAffinities[t3];
        uint16[] storage affinityT4 = traitsToAffinities[t4];
        uint16[] storage affinityT5 = traitsToAffinities[t5];

        uint16[] memory affinitiesList = new uint16[](
            affinityT1.length +
                affinityT2.length +
                affinityT3.length +
                affinityT4.length +
                affinityT5.length
        );

        uint256 lastIndexWritten = 0;

        // 7777 is used as a filler for empty Trait slots
        if (t1 != 7777) {
            for (uint256 i = 0; i < affinityT1.length; i++) {
                affinitiesList[i] = affinityT1[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT1.length;
        }

        if (t2 != 7777) {
            for (uint256 i = 0; i < affinityT2.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT2[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT2.length;
        }

        if (t3 != 7777) {
            for (uint8 i = 0; i < affinityT3.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT3[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT3.length;
        }

        if (t4 != 7777) {
            for (uint8 i = 0; i < affinityT4.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT4[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT4.length;
        }

        if (t5 != 7777) {
            for (uint8 i = 0; i < affinityT5.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT5[i];
            }
        }

        return affinitiesList;
    }

    function getWizardIdentityAffinities(uint256 wizardId)
        public
        view
        returns (uint16[] memory)
    {
        // ignore id and t0 (background has no affinity)
        (, , uint16 t1, uint16 t2, uint16 t3, uint16 t4, uint16 t5) = _decode(
            wizardToTraits[wizardId]
        );

        uint16[] storage affinityT1 = traitsToIdentity[t1];
        uint16[] storage affinityT2 = traitsToIdentity[t2];
        uint16[] storage affinityT3 = traitsToIdentity[t3];
        uint16[] storage affinityT4 = traitsToIdentity[t4];
        uint16[] storage affinityT5 = traitsToIdentity[t5];

        uint16[] memory affinitiesList = new uint16[](
            affinityT1.length +
                affinityT2.length +
                affinityT3.length +
                affinityT4.length +
                affinityT5.length
        );

        uint256 lastIndexWritten = 0;

        // 7777 is used as a filler for empty Trait slots
        if (t1 != 7777) {
            for (uint256 i = 0; i < affinityT1.length; i++) {
                affinitiesList[i] = affinityT1[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT1.length;
        }

        if (t2 != 7777) {
            for (uint256 i = 0; i < affinityT2.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT2[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT2.length;
        }

        if (t3 != 7777) {
            for (uint8 i = 0; i < affinityT3.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT3[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT3.length;
        }

        if (t4 != 7777) {
            for (uint8 i = 0; i < affinityT4.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT4[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT4.length;
        }

        if (t5 != 7777) {
            for (uint8 i = 0; i < affinityT5.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT5[i];
            }
        }

        return affinitiesList;
    }

    function getWizardPositiveAffinities(uint256 wizardId)
        public
        view
        returns (uint16[] memory)
    {
        // ignore id and t0 (background has no affinity)
        (, , uint16 t1, uint16 t2, uint16 t3, uint16 t4, uint16 t5) = _decode(
            wizardToTraits[wizardId]
        );

        uint16[] storage affinityT1 = traitsToPositive[t1];
        uint16[] storage affinityT2 = traitsToPositive[t2];
        uint16[] storage affinityT3 = traitsToPositive[t3];
        uint16[] storage affinityT4 = traitsToPositive[t4];
        uint16[] storage affinityT5 = traitsToPositive[t5];

        uint16[] memory affinitiesList = new uint16[](
            affinityT1.length +
                affinityT2.length +
                affinityT3.length +
                affinityT4.length +
                affinityT5.length
        );

        uint256 lastIndexWritten = 0;

        // 7777 is used as a filler for empty Trait slots
        if (t1 != 7777) {
            for (uint256 i = 0; i < affinityT1.length; i++) {
                affinitiesList[i] = affinityT1[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT1.length;
        }

        if (t2 != 7777) {
            for (uint256 i = 0; i < affinityT2.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT2[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT2.length;
        }

        if (t3 != 7777) {
            for (uint8 i = 0; i < affinityT3.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT3[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT3.length;
        }

        if (t4 != 7777) {
            for (uint8 i = 0; i < affinityT4.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT4[i];
            }
            lastIndexWritten = lastIndexWritten + affinityT4.length;
        }

        if (t5 != 7777) {
            for (uint8 i = 0; i < affinityT5.length; i++) {
                affinitiesList[lastIndexWritten + i] = affinityT5[i];
            }
        }

        return affinitiesList;
    }

    function getWizardTraitsEncoded(uint256 id)
        public
        view
        returns (bytes memory)
    {
        return wizardToTraits[id];
    }

    /**
        INTERNAL
     */

    function _verifyName(
        bytes32[] memory proof,
        uint256 wizardId,
        string memory name
    ) internal view returns (bool) {
        return
            MerkleProof.verify(
                proof,
                merkleRootNamesTree,
                keccak256(abi.encode(wizardId, name))
            );
    }

    function _verifyEncodedTraits(bytes32[] memory proof, bytes memory traits)
        internal
        view
        returns (bool)
    {
        bytes32 hashedTraits = keccak256(abi.encodePacked(traits));
        return MerkleProof.verify(proof, merkleRootTraitsTree, hashedTraits);
    }

    function _encode(
        uint16 id,
        uint16 t0,
        uint16 t1,
        uint16 t2,
        uint16 t3,
        uint16 t4,
        uint16 t5
    ) internal pure returns (bytes memory) {
        bytes memory data = new bytes(16);

        assembly {
            mstore(add(data, 32), 32)

            mstore(add(data, 34), shl(240, id))
            mstore(add(data, 36), shl(240, t0))
            mstore(add(data, 38), shl(240, t1))
            mstore(add(data, 40), shl(240, t2))
            mstore(add(data, 42), shl(240, t3))
            mstore(add(data, 44), shl(240, t4))
            mstore(add(data, 46), shl(240, t5))
        }

        return data;
    }

    function _decode(bytes memory data)
        internal
        pure
        returns (
            uint16 id,
            uint16 t0,
            uint16 t1,
            uint16 t2,
            uint16 t3,
            uint16 t4,
            uint16 t5
        )
    {
        assembly {
            let len := mload(add(data, 0))

            id := mload(add(data, 4))
            t0 := mload(add(data, 6))
            t1 := mload(add(data, 8))
            t2 := mload(add(data, 10))
            t3 := mload(add(data, 12))
            t4 := mload(add(data, 14))
            t5 := mload(add(data, 16))
        }
    }
}

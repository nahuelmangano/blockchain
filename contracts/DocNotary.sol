// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocNotary {
    struct Record {
        address owner;
        uint256 timestamp;
        string uri;
        bool exists;
    }

    mapping(bytes32 => Record) public records;

    event DocumentNotarized(bytes32 indexed hash, address indexed owner, uint256 timestamp, string uri);

    function notarize(bytes32 fileHash, string calldata uri) external {
        require(fileHash != bytes32(0), "hash invalido");
        require(!records[fileHash].exists, "ya registrado");
        records[fileHash] = Record(msg.sender, block.timestamp, uri, true);
        emit DocumentNotarized(fileHash, msg.sender, block.timestamp, uri);
    }

    function isNotarized(bytes32 fileHash) external view returns (bool, address, uint256, string memory) {
        Record memory r = records[fileHash];
        return (r.exists, r.owner, r.timestamp, r.uri);
    }
}


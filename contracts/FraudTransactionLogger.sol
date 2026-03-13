// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FraudTransactionLogger
 * @dev Smart contract for storing and verifying fraud transaction hashes on blockchain
 * Provides tamper-proof logging of high-risk transactions detected by AI model
 */

contract FraudTransactionLogger {
    
    // Struct to store transaction hash record
    struct TransactionRecord {
        string transactionId;
        string transactionHash;
        uint256 timestamp;
        address loggedBy;
        bool verified;
    }
    
    // Mapping from transaction ID to transaction record
    mapping(string => TransactionRecord) public transactionRecords;
    
    // Array to keep track of all logged transaction IDs
    string[] public loggedTransactionIds;
    
    // Event emitted when a transaction is logged
    event TransactionLogged(
        string indexed transactionId,
        string transactionHash,
        uint256 timestamp,
        address indexed loggedBy
    );
    
    // Event emitted when a transaction is verified
    event TransactionVerified(
        string indexed transactionId,
        bool isValid
    );
    
    // Owner of the contract
    address public owner;
    
    // Modifier to restrict functions to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Constructor sets the contract owner
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Log a high-risk transaction hash on the blockchain
     * @param _transactionId The unique identifier of the transaction
     * @param _transactionHash The SHA256 hash of the transaction data
     */
    function logTransaction(
        string memory _transactionId,
        string memory _transactionHash
    ) public onlyOwner {
        require(bytes(_transactionId).length > 0, "Transaction ID cannot be empty");
        require(bytes(_transactionHash).length > 0, "Transaction hash cannot be empty");
        
        // Check if transaction already logged
        require(
            bytes(transactionRecords[_transactionId].transactionId).length == 0,
            "Transaction already logged"
        );
        
        // Create new transaction record
        TransactionRecord memory record = TransactionRecord({
            transactionId: _transactionId,
            transactionHash: _transactionHash,
            timestamp: block.timestamp,
            loggedBy: msg.sender,
            verified: true
        });
        
        // Store the record
        transactionRecords[_transactionId] = record;
        loggedTransactionIds.push(_transactionId);
        
        // Emit event
        emit TransactionLogged(
            _transactionId,
            _transactionHash,
            block.timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Retrieve the logged hash for a transaction
     * @param _transactionId The unique identifier of the transaction
     * @return The stored transaction hash, or empty string if not found
     */
    function getTransactionHash(string memory _transactionId)
        public
        view
        returns (string memory)
    {
        if (bytes(transactionRecords[_transactionId].transactionId).length == 0) {
            return "";
        }
        return transactionRecords[_transactionId].transactionHash;
    }
    
    /**
     * @dev Retrieve full transaction record
     * @param _transactionId The unique identifier of the transaction
     * @return The transaction record with all details
     */
    function getTransactionRecord(string memory _transactionId)
        public
        view
        returns (TransactionRecord memory)
    {
        return transactionRecords[_transactionId];
    }
    
    /**
     * @dev Verify if a transaction hash matches the stored blockchain record
     * @param _transactionId The unique identifier of the transaction
     * @param _transactionHash The hash to verify against stored hash
     * @return true if hashes match, false otherwise
     */
    function verifyTransaction(
        string memory _transactionId,
        string memory _transactionHash
    ) public returns (bool) {
        require(
            bytes(transactionRecords[_transactionId].transactionId).length > 0,
            "Transaction not found in blockchain"
        );
        
        bool isValid = keccak256(abi.encodePacked(transactionRecords[_transactionId].transactionHash)) ==
                       keccak256(abi.encodePacked(_transactionHash));
        
        emit TransactionVerified(_transactionId, isValid);
        return isValid;
    }
    
    /**
     * @dev Get count of logged transactions
     * @return Number of transactions logged on blockchain
     */
    function getLoggedTransactionCount() public view returns (uint256) {
        return loggedTransactionIds.length;
    }
    
    /**
     * @dev Get transaction ID at specific index
     * @param _index The index in the logged transactions array
     * @return The transaction ID at that index
     */
    function getLoggedTransactionId(uint256 _index)
        public
        view
        returns (string memory)
    {
        require(_index < loggedTransactionIds.length, "Index out of bounds");
        return loggedTransactionIds[_index];
    }
    
    /**
     * @dev Transfer ownership to new owner
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }
}

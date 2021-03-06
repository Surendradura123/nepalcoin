//calling the classes
const Block = require('./block');
const { cryptoHash } = require('../cryptohash');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

// creating the blockchain class
class Blockchain {

    // making the blockchain using genesis block
    constructor() {
        this.chain = [Block.genesis()];
    }

    //adding the block in chain
    addBlock({ data}){
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    //replacing chain function
    replaceChain(chain, validateTransactions, onSuccess){
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer')
            return;
        }
        if(!Blockchain.isValidChain(chain)){
            console.error('The incoming chain must be valid');
            return;
        }

        if (validateTransactions && !this.validTransactionData({ chain })) {
            console.error('The incoming chain has invalid data');
            return;
        }

        if(onSuccess) onSuccess();
        console.log('replacing chain with', chain);
        this.chain = chain;
    }

    //validating transaction data in the blockchain
    validTransactionData({ chain }) {
        for (let i=1; i<chain.length; i++) {
          const block = chain[i];
          const transactionSet = new Set();
          let rewardTransactionCount = 0;
    
          for (let transaction of block.data) {
            if (transaction.input.address === REWARD_INPUT.address) {
              rewardTransactionCount += 1;
    
              if (rewardTransactionCount > 1) {
                console.error('Miner rewards exceed limit');
                return false;
              }
    
              if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                console.error('Miner reward amount is invalid');
                return false;
              }
            } else {
              if (!Transaction.validTransaction(transaction)) {
                console.error('Invalid transaction');
                return false;
              }
              
              //making a true balance 
              const trueBalance = Wallet.calculateBalance({
                chain: this.chain,
                address: transaction.input.address
              });
    
              if (transaction.input.amount !== trueBalance) {
                console.error('Invalid input amount');
                return false;
              }
    
              if (transactionSet.has(transaction)) {
                console.error('An identical transaction appears more than once in the block');
                return false;
              } else {
                transactionSet.add(transaction);
              }
            }
          }
        }
        return true;
    }

    // validating the chain
    static isValidChain(chain) {
        // it show that chain should start with genesis block
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        };

        // making a validating chain in loop
        for (let i=1; i<chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;
      
            if (lastHash !== actualLastHash) return false;
      
            const validatedHash = cryptoHash(timestamp, lastHash, data , nonce, difficulty);
      
            if (hash !== validatedHash) return false;

            if ((lastDifficulty - difficulty) > 1) return false;
      
        }

        return true;

    }

}

module.exports = Blockchain;
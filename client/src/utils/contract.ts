// src/utils/contract.ts
import { createConfig, http } from 'wagmi'
import { curtis } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

export const config = createConfig(
  getDefaultConfig({
    // alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: 'AfriCropDAO',
    chains: [curtis],
    transports: {
      [curtis.id]: http(),
    },
  })
)

export const contractAddress = '0xA79974A617cFD0658bCedD0821A46255d5Df57c9' // Replace with actual address

export const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__AlreadyRegistered",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__AlreadyVoted",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__CropNotFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        }
      ],
      "name": "AfriCropDAO__FarmerNotRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__InsufficientFunds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__InsufficientReputationForMentorship",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__InsufficientStake",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "internalType": "enum AfriCropDAO.CropStage",
          "name": "expectedStage",
          "type": "uint8"
        }
      ],
      "name": "AfriCropDAO__InvalidCropStage",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__InvalidDonationAmount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__LessonAlreadyCompleted",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__ListingNotFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotCropOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "available",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "requested",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotEnoughInSilo",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotHarvested",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotListingOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotSelling",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__NotStored",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__ProposalNotExecutable",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__ProposalNotFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requiredStake",
          "type": "uint256"
        }
      ],
      "name": "AfriCropDAO__StakeRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AfriCropDAO__ZeroAmount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "CropListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "CropListingCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "daoFee",
          "type": "uint256"
        }
      ],
      "name": "CropPurchased",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum AfriCropDAO.CropType",
          "name": "cropType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "farmId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "CropSown",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum AfriCropDAO.CropStage",
          "name": "newStage",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "CropStageUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "CropStored",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "name": "DataRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reputationPoints",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "sustainabilityScore",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "knowledgePoints",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "harvestPoints",
          "type": "uint256"
        }
      ],
      "name": "FarmerHistoryRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "initialReputation",
          "type": "uint256"
        }
      ],
      "name": "FarmerRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundAllocationExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPoints",
          "type": "uint256"
        }
      ],
      "name": "HarvestPointsUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPoints",
          "type": "uint256"
        }
      ],
      "name": "KnowledgePointsUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lessonId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "knowledgePointsReward",
          "type": "uint256"
        }
      ],
      "name": "LessonAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "lessonId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "knowledgePointsEarned",
          "type": "uint256"
        }
      ],
      "name": "LessonCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum AfriCropDAO.ProposalType",
          "name": "proposalType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stake",
          "type": "uint256"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "ProposalExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newReputation",
          "type": "uint256"
        }
      ],
      "name": "ReputationUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newScore",
          "type": "uint256"
        }
      ],
      "name": "SustainabilityScoreUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reputationAdded",
          "type": "uint256"
        }
      ],
      "name": "TreasuryDonation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TreasuryWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "vote",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "weight",
          "type": "uint256"
        }
      ],
      "name": "VoteCast",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DAO_FEE_PERCENT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "activeListings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_content",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_question1",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option1A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option1B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option1C",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_question2",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option2A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option2B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option2C",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_question3",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option3A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option3B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_option3C",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_knowledgePointsReward",
          "type": "uint256"
        }
      ],
      "name": "addLesson",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "calculateVotingPower",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_listingId",
          "type": "uint256"
        }
      ],
      "name": "cancelCropListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_lessonId",
          "type": "uint256"
        }
      ],
      "name": "completeLesson",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "completedLessons",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "enum AfriCropDAO.ProposalType",
          "name": "_proposalType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_targetAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "createProposal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum AfriCropDAO.CropType",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "cropHarvestPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum AfriCropDAO.CropType",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "cropSustainabilityScores",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "crops",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "farmerAddress",
          "type": "address"
        },
        {
          "internalType": "enum AfriCropDAO.CropType",
          "name": "cropType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "farmId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "sownTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "harvestedTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "enum AfriCropDAO.CropStage",
          "name": "stage",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "initialSeeds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "harvestedOutput",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "deviceData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "moisture",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "temperature",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "humidity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localTime",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "donateToTreasury",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "executeProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "farmerCrops",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "farmerHistory",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reputationPoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "sustainabilityScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "knowledgePoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "harvestPoints",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "farmerStoredCrops",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "farmers",
      "outputs": [
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "reputationPoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "sustainabilityScore",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "knowledgePoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "harvestPoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastProposalStakeTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveMarketListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "priceInWei",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantityToSell",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "listingTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct AfriCropDAO.MarketListing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveProposals",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "proposer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "enum AfriCropDAO.ProposalType",
              "name": "proposalType",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "stakeAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "yesVotes",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "noVotes",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "executed",
              "type": "bool"
            },
            {
              "internalType": "enum AfriCropDAO.ProposalStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "targetAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "internalType": "struct AfriCropDAO.ProposalView[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllFarmers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllLessons",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question1",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1C",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question2",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2C",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question3",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3C",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "knowledgePointsReward",
              "type": "uint256"
            }
          ],
          "internalType": "struct AfriCropDAO.Lesson[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCropTypes",
      "outputs": [
        {
          "internalType": "string[11]",
          "name": "",
          "type": "string[11]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "getFarmerCrops",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "getFarmerHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "reputationPoints",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sustainabilityScore",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "knowledgePoints",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "harvestPoints",
              "type": "uint256"
            }
          ],
          "internalType": "struct AfriCropDAO.FarmerHistory[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "getFarmerProfile",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "reputationPoints",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sustainabilityScore",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "knowledgePoints",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "harvestPoints",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastProposalStakeTime",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isRegistered",
              "type": "bool"
            }
          ],
          "internalType": "struct AfriCropDAO.Farmer",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "getFarmerStoredCrops",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_lessonId",
          "type": "uint256"
        }
      ],
      "name": "getLesson",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question1",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option1C",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question2",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option2C",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "question3",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3A",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3B",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "option3C",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "knowledgePointsReward",
              "type": "uint256"
            }
          ],
          "internalType": "struct AfriCropDAO.Lesson",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposalStatus",
      "outputs": [
        {
          "internalType": "enum AfriCropDAO.ProposalStatus",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProposalTypes",
      "outputs": [
        {
          "internalType": "string[3]",
          "name": "",
          "type": "string[3]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRegisteredFarmers",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        }
      ],
      "name": "getSensorData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "moisture",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "temperature",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "humidity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localTime",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        }
      ],
      "name": "getSensorReadings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "moisture",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "temperature",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "humidity",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSustainabilityScores",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getTopCrops",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "farmerAddress",
              "type": "address"
            },
            {
              "internalType": "enum AfriCropDAO.CropType",
              "name": "cropType",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "farmId",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "sownTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "harvestedTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "enum AfriCropDAO.CropStage",
              "name": "stage",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "initialSeeds",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "harvestedOutput",
              "type": "uint256"
            }
          ],
          "internalType": "struct AfriCropDAO.Crop[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getTopFarmersBySustainability",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTreasuryBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_farmerAddress",
          "type": "address"
        }
      ],
      "name": "getVoteWeight",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lastUpdateTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lessons",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "question1",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option1A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option1B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option1C",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "question2",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option2A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option2B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option2C",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "question3",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option3A",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option3B",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "option3C",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "knowledgePointsReward",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_cropId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_priceInWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_quantityToSell",
          "type": "uint256"
        }
      ],
      "name": "listCropForSale",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "marketListings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "priceInWei",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantityToSell",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "listingTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "proposals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "enum AfriCropDAO.ProposalType",
          "name": "proposalType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "stakeAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "yesVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "noVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        },
        {
          "internalType": "enum AfriCropDAO.ProposalStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "targetAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_listingId",
          "type": "uint256"
        }
      ],
      "name": "purchaseCrop",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "deviceId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "moisture",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "temperature",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "humidity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "status",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "localTime",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "recordSensorData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "registerFarmer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "registeredFarmers",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum AfriCropDAO.CropType",
          "name": "_cropType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_farmId",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_initialSeeds",
          "type": "uint256"
        }
      ],
      "name": "sowCrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_cropId",
          "type": "uint256"
        }
      ],
      "name": "storeCrop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_cropId",
          "type": "uint256"
        },
        {
          "internalType": "enum AfriCropDAO.CropStage",
          "name": "_newStage",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "_lossPercentage",
          "type": "uint256"
        }
      ],
      "name": "updateCropStage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_vote",
          "type": "bool"
        }
      ],
      "name": "voteOnProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdrawDAOFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] // Paste the ABI from your contract
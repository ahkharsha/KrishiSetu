require("dotenv").config(); // Load environment variables
require("@nomicfoundation/hardhat-toolbox");

const { NEXT_PUBLIC_PRIVATE_KEY } = process.env;

const RPC_URL = "https://curtis.rpc.caldera.xyz/http";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    curtis_ape: {
      url: RPC_URL,
      accounts: [`0x${NEXT_PUBLIC_PRIVATE_KEY}`],
    },
  },
};
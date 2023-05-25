# AAVE v3 collaterallized loans tool box

This is a simple application using [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + [Next.js](https://nextjs.org/) in order to interact with the smart contacts of [AAVE v3](https://aave.com) on the test networks of Polygon, Arbitrum and Optimism


## Setup

Fill the required smart contract addresses in the file `constants/contracts.js`. The contracts for Polygon Mumbai have been already filled

You can find the smart contract addresses in the official AAVE [Documentation](https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses) 

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying . The page auto-updates as you edit the file.

## Completing the functions

Complete the file `pages/index.js` and create your custom components and funtions using Wagmi as a base

## Example

To delegate collateral use the following function:

```
    const { request } = await prepareWriteContract({
      address: variableDebtAToken,
      abi: ICreditDelegationTokenArtifact.abi,
      functionName: 'approveDelegation',
      args: [delegatee, parseUnits(amount, reserveDecimals)],
    })

    const { hash } = await writeContract(request)
```

## Resources and Documentation

To learn more about this stack, take a look at the following resources:

- [AAVE v3](https://github.com/aave/aave-v3-core) - Learn how to interact with the protocol smart contracts
- [RainbowKit Documentation](https://rainbowkit.com) - Learn how to customize your wallet connection flow.
- [wagmi Documentation](https://wagmi.sh) - Learn how to interact with Ethereum.
- [Next.js Documentation](https://nextjs.org/docs) - Learn how to build a Next.js application.

You can check out [the RainbowKit GitHub repository](https://github.com/rainbow-me/rainbowkit) - your feedback and contributions are welcome!
import { useState, useEffect } from 'react';
import { ConnectButton, RainbowKitProvider, Chain, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { polygonMumbai, avalancheFuji, arbitrumGoerli } from 'wagmi/chains'
import { getNetwork, readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import Card from '../components/Card';

import { publicProvider } from 'wagmi/providers/public'
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { isAddress, parseUnits } from 'viem';

const { chains, publicClient } = configureChains(
  [polygonMumbai, avalancheFuji, arbitrumGoerli],[publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'AAVE course',
  projectId: 'YOUR_PROJECT_ID',
  chains  
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const deployedContracts = {
  // Selecting by chainID
  // Mumbai
  80001: {
      PoolAddressesProvider: '0xeb7A892BB04A8f836bDEeBbf60897A7Af1Bf5d7F',
      FlashLoanLogic: '0x031CBBa04b974eC56C5bd5B87096b3B4AC0E4e57',
      Pool: '0x4ff9EB4C5F5f790CE7bB51d4876481C2eefDE00F',
      USDC: '0xe9DcE89B076BA6107Bb64EF30678efec11939234',
      USDC_AToken: '0x9daBC9860F8792AeE427808BDeF1f77eFeF0f24E',
      USDC_VariableDebtToken: '0xdbFB1eE219CA788B02d50bA687a927ABf58A8fC0',
      USDC_StableDebtToken: '0xe336CbD5416CDB6CE70bA16D9952A963a81A918d'         
  },

  // Arbitrum Goerli
  421613: {},

  // Avalanche Fuji

  43113: {

  }
}

const Home: NextPage = () => {
  const [reserves, setReserves] = useState([]);

  useEffect(() => {
    fetchReserves().then(setReserves);
  }, []);


  const getDeployedContract = async (contractName: String) =>  {
    const { chain } = getNetwork()
    let chainId = 80001
    chain? chainId = chain.id : chainId    
    const PoolAddressesProvideArtifact = require('@aave/core-v3/artifacts/contracts/interfaces/IPoolAddressesProvider.sol/IPoolAddressesProvider.json');

    return await readContract({
      address: deployedContracts[chainId].PoolAddressesProvider,
      abi: PoolAddressesProvideArtifact.abi,
      functionName: contractName
    })
  }

  const delegateCollateral = async (reserve: string, delegatee: string, amount: string) => {
    const ProtocolDataProviderArtifact = require('@aave/core-v3/artifacts/contracts/interfaces/IPoolDataProvider.sol/IPoolDataProvider.json');
    const ICreditDelegationTokenArtifact = require('@aave/core-v3/artifacts/contracts/interfaces/ICreditDelegationToken.sol/ICreditDelegationToken.json');
    const ERC20ABI = require('../constants/artifacts/ERC20.json')

    const PoolDataProviderAddress = await getDeployedContract('getPoolDataProvider') 
    const [supplyAToken, stableDebtAToken, variableDebtAToken] = await readContract({
      address: PoolDataProviderAddress,
      abi: ProtocolDataProviderArtifact.abi,
      functionName: 'getReserveTokensAddresses',
      args: [reserve]
    })

    const reserveDecimals = await readContract({
      address: reserve,
      abi: ERC20ABI,
      functionName: 'decimals'
    })
    const { request } = await prepareWriteContract({
      address: variableDebtAToken,
      abi: ICreditDelegationTokenArtifact.abi,
      functionName: 'approveDelegation',
      args: [delegatee, parseUnits(amount, reserveDecimals)],
    })

    const { hash } = await writeContract(request)
    return hash
  }

  const requestCollateralizedLoan = async (reserve: string, delegator: string, amount: string) => {
    const PoolArtifact = require('@aave/core-v3/artifacts/contracts/interfaces/IPool.sol/IPool.json');
    const ERC20ABI = require('../constants/artifacts/ERC20.json')

    const PoolAddress = await getDeployedContract('getPool')
    console.log("🚀 ~ file: index.tsx:106 ~ requestCollateralizedLoan ~ PoolAddress:", PoolAddress)
    const reserveDecimals = await readContract({
      address: reserve,
      abi: ERC20ABI,
      functionName: 'decimals'
    })
    const { request } = await prepareWriteContract({
      address: PoolAddress,
      abi: PoolArtifact.abi,
      functionName: 'borrow',
      // Args: address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf
      // Interest rate mode: 1 stable, 2 variable
      // Referral code usually 0
      args: [reserve, parseUnits(amount, reserveDecimals), 2, 0, delegator],
    })

    const { hash } = await writeContract(request)
    console.log("🚀 ~ file: index.tsx:124 ~ requestCollateralizedLoan ~ hash:", hash)
  }

  const fetchReserves = async () => {
    const ProtocolDataProviderArtifact = require('@aave/core-v3/artifacts/contracts/interfaces/IPoolDataProvider.sol/IPoolDataProvider.json');

    const PoolDataProviderAddress = await getDeployedContract('getPoolDataProvider')     
    const reserves = await readContract({
      address: PoolDataProviderAddress,
      abi: ProtocolDataProviderArtifact.abi,
      functionName: 'getAllReservesTokens'
    })
    return reserves
   
  }

  const submitDelegate = async (reserve: string, address: string, amount: string) => {
    try {
      console.log("Address:", address);
      console.log("Reserve:", reserve);
      console.log("Number:", typeof(amount));
      if (!isAddress(address)) throw new Error('Not a valid address')
      const txHash = await delegateCollateral(reserve, address, amount)
      console.log("🚀 ~ file: index.tsx:154 ~ submitDelegate ~ txHash:", txHash)
    } catch (error) {
      console.error(error)
    }

  };
  
  const submitBorrow = async (reserve: string, address: string, amount: string) => {
    try {
      console.log("Address:", address);
      console.log("Number:", typeof(amount));
      if (!isAddress(address)) throw new Error('Not a valid address')
      const txHash = await requestCollateralizedLoan(reserve, address, amount)
      console.log("🚀 ~ file: index.tsx:167 ~ submitBorrow ~ txHash:", txHash)

    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>AAVE interaction app</title>
        <meta
          content="Generated by @rainbow-me/create-rainbowkit"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains} >
            <ConnectButton />

          </RainbowKitProvider>
        </WagmiConfig>


        <h1 className={styles.title}>
          Welcome to <a href="">AAVE</a> + <a href="">tester</a> 
        </h1>

        <Card title="Delegate Credit" addressLabel="Delegatee address" reserves={reserves} onSubmit={submitDelegate} />
        <div className='my-5'></div>
        <Card title="Request a credit delegation" addressLabel="Delegator address" reserves={reserves} onSubmit={submitBorrow} />

      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;

// Add a function that shows a console.log when the page is rendered
const handleRender = () => {
  console.log('The page has been rendered!');
};

Home.getInitialProps = async () => {
  // Do something before the page is rendered
  handleRender();
  return {}
};


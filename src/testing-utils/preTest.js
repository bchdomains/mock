import deployENS from './deployENS.js'
import Web3 from 'web3'
import fs from 'fs'

let web3

export async function getAccounts(web3) {
  return web3.eth.getAccounts()
}

async function setupWeb3(customProvider) {
  web3 = new Web3(customProvider)
  const networkId = await web3.eth.net.getId()

  return {
    web3,
    networkId
  }
}

async function init() {
  console.log(1)
  const ENV = process.argv[2]
  const dnssec = process.argv[3] === 'dnssec'
  console.log(2)
  switch (ENV) {
    case 'GANACHE_GUI':
      var provider = new Web3.providers.HttpProvider('http://localhost:7545')
      var { web3 } = await setupWeb3(provider)
      break
    case 'GANACHE_CLI':
      var provider = new Web3.providers.HttpProvider('http://localhost:8545')
      var { web3 } = await setupWeb3(provider)
      break
    default:
      var provider = new Web3.providers.HttpProvider('http://localhost:8545')
      var { web3 } = await setupWeb3(provider)
      break
  }
  console.log(3)
  const accounts = await getAccounts(web3)
  console.log(4)
  const addresses = await deployENS({ web3, accounts, dnssec })
  console.log(5, {addresses})
  const {
    ensAddress,
    oldResolverAddresses,
    oldContentResolverAddresses,
    labels
  } = addresses
  const envLocalFile = './.env.local'
  fs.writeFileSync('./cypress.env.json', JSON.stringify(addresses))
  fs.writeFileSync(envLocalFile, `REACT_APP_ENS_ADDRESS=${ensAddress}`)
  fs.appendFileSync(envLocalFile, '\n')
  fs.appendFileSync(envLocalFile, `REACT_APP_LABELS=${JSON.stringify(labels)}`)
  fs.appendFileSync(envLocalFile, '\n')
  console.log(`Successfully wrote ENS address ${ensAddress} to .env.local`)
  fs.appendFileSync(
    envLocalFile,
    `REACT_APP_DEPRECATED_RESOLVERS=${oldResolverAddresses.join(',')}`
  )
  fs.appendFileSync(envLocalFile, '\n')
  fs.appendFileSync(
    envLocalFile,
    `REACT_APP_OLD_CONTENT_RESOLVERS=${oldContentResolverAddresses.join(',')}`
  )
  console.log(
    `Successfully wrote Old resolver address ${oldResolverAddresses.join(
      ','
    )} to .env.local`
  )
  console.log(
    `Successfully wrote Old content resolver address ${oldContentResolverAddresses.join(
      ','
    )} to .env.local`
  )
}

init()

import { Agent, DidsModule, KeyType, DidDocument, InitConfig } from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'
import { AskarModule } from '@aries-framework/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

import { IndyVdrIndyDidResolver, IndyVdrIndyDidRegistrar, IndyVdrModule } from '@aries-framework/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'

import dotenv from 'dotenv';

dotenv.config();
import axios from 'axios';

const config: InitConfig = {
    label: 'docs-agent-nodejs',
    walletConfig: {
      id: 'wallet-id',
      key: 'testkey0000000000000000000000000',
    },
  }

const createAgent = async () => {
    const res = await axios.get(process.env.GENESIS_URL_LINK as string);
    
    const agent = new Agent({
        config,
          dependencies: agentDependencies,
          modules: {
            dids: new DidsModule({
                registrars: [new IndyVdrIndyDidRegistrar()],
                resolvers: [new IndyVdrIndyDidResolver()],
              }),
              indyVdr: new IndyVdrModule({
                indyVdr,
                networks: [
                  {
                    isProduction: false,
                    indyNamespace: 'von',
                    genesisTransactions: res.data,
                    connectOnStartup: true,
                  },
                ],
              }),
        
            askar: new AskarModule({
              ariesAskar,
            }),
          },
        })
        console.log(agent);
        
}
createAgent();
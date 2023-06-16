import { Agent, DidsModule, KeyType, DidDocument, InitConfig } from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'
import { AskarModule } from '@aries-framework/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

import { IndyVdrAnonCredsRegistry,IndyVdrIndyDidResolver, IndyVdrModule } from '@aries-framework/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'
import { AnonCredsModule,  } from '@aries-framework/anoncreds'
const config: InitConfig = {
    label: 'docs-agent-nodejs',
    walletConfig: {
      id: 'wallet-id',
      key: 'testkey0000000000000000000000000',
    },
  }

const agent = new Agent({
config,
  dependencies: agentDependencies,
  modules: {
    dids: new DidsModule({
        resolvers: [new IndyVdrIndyDidResolver()],
      }),
      indyVdr: new IndyVdrModule({
        indyVdr,
        networks: [
          {
            isProduction: false,
            indyNamespace: 'von',
            genesisTransactions: '<genesis_transactions>',
            connectOnStartup: true,
          },
        ],
      }),
    // AnonCreds
    anoncreds: new AnonCredsModule({
      registries: [new IndyVdrAnonCredsRegistry()],
    }),

    askar: new AskarModule({
      ariesAskar,
    }),
  },
})
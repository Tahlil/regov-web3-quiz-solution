import {
  Agent,
  DidsModule,
  DidDocument,
  InitConfig,

} from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import { AskarModule, AskarWallet } from "@aries-framework/askar";
import {
  ariesAskar,
  Store,
  Key,
  KeyAlgs,
  StoreKeyMethod,
  KdfMethod,
  
} from "@hyperledger/aries-askar-nodejs";

import { mkdirSync, promises } from "fs";

import {
  IndyVdrIndyDidResolver,
  IndyVdrIndyDidRegistrar,
  IndyVdrModule,
} from "@aries-framework/indy-vdr";
import { indyVdr } from "@hyperledger/indy-vdr-nodejs";

import dotenv from "dotenv";
import path from 'path'
dotenv.config();
import axios from "axios";

const config: InitConfig = {
  label: "user-agent",
  walletConfig: {
    id: 'wallet-id',
    key: 'testkey0000000000000000000000000',
  },
};

function uint8ArrayToFixedLengthText(uint8Array: Uint8Array, length: number): string {
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
    const alphanumericOnly = base64.replace(/[^A-Za-z0-9]/g, '');
    const truncatedOrPadded = alphanumericOnly.slice(0, length).padEnd(length, '0');
    return truncatedOrPadded;
  }

const newWallet = async () => {
  const storagePath = process.env.DATABASE_PATH as string;
  try {
    await promises.access(storagePath);
  } catch {
    mkdirSync(storagePath, 0o0744);
  }
  
  let store;
  try {
    await promises.access(path.join(storagePath, "regov.db"));
    console.log("DB already created");
    
    store = await Store.open({
        uri: `sqlite://${storagePath}/regov.db`,
        profile: 'regov',
          passKey: "123321"
    
      })
  } catch {
    console.log("DB not created");
    
    store = await Store.provision({
        uri: `sqlite://${storagePath}/regov.db`,
        recreate: true,
        profile: 'regov',
        passKey: "123321"
    });
  }

  const keyName = process.env.KEY_NAME + "";
  const session = await store.openSession();
  let key = (await session.fetchKey({ name: keyName }));
  if(!key){
      console.log("Key not saved");
      const newKey = Key.generate(KeyAlgs.Bls12381G1)
      await session.insertKey({
          key: newKey,
          name: keyName
      })
  }
  key = (await session.fetchKey({
      name: keyName
  }));
 
  const keyAsBytes =key?.key.secretBytes as Uint8Array

  const keyString = uint8ArrayToFixedLengthText(keyAsBytes, 32);

  await session.close();
  return keyString;
  
};
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
            indyNamespace: "von",
            genesisTransactions: res.data,
            connectOnStartup: true,
          },
        ],
      }),

      askar: new AskarModule({
        ariesAskar,
      }),
    },
  });
  await agent.initialize();
  console.log(agent);

  return agent;
};
// createAgent()
newWallet();
// console.log(agentDependencies);

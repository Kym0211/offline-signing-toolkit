#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { sign } from "./sign.js"; 
import { broadcast } from "./broadcast.js"; 
import { solTransfer } from "./sol_transfer.js"
import { tokenTransfer } from "./token_transfer.js"
import { createNonce } from "./create_nonce.js"

yargs(hideBin(process.argv))
  .command(
    'sign',
    'Sign an offline transaction',
    (yargs) => {
      return yargs
        .option('unsigned', {
          alias: 'u',
          type: 'string',
          description: 'Path to the unsigned transaction file',
          default: 'unsigned-tx.json',
        })
        .option('keypair', {
          alias: 'k',
          type: 'string',
          description: 'Path to the cold wallet keypair file',
          default: 'cold-wallet.json',
        });
    },
    (argv) => {
      console.log('Signing transaction...');
      sign(argv.unsigned, argv.keypair);
    }
  )

  .command(
    'broadcast',
    'Broadcast a signed transaction',
    (yargs) => {
      return yargs
        .option('unsigned', {
          alias: 'u',
          type: 'string',
          description: 'Path to the original unsigned transaction file',
          default: 'unsigned-tx.json',
        })
        .option('signature', {
          alias: 's',
          type: 'string',
          description: 'Path to the signature file',
          default: 'signature.json',
        });
    },
    (argv) => {
      console.log('Broadcasting transaction...');
      broadcast(argv.unsigned, argv.signature);
    }
  )
  .command(
    'sol-transfer',
    'Construct an unsigned SOL transfer transaction',
    (yargs) => {
      return yargs
        .option('recipient', {
          alias: 'r',
          type: 'string',
          description: 'Recipient public key',
          demandOption: true, 
        })
        .option('amount', {
          alias: 'a',
          type: 'number',
          description: 'Amount of SOL to send',
          demandOption: true,
        })
        .option('sender', {
          alias: 's',
          type: 'string',
          description: 'Sender public key (cold wallet)',
          demandOption: true,
        })
        .option('nonce', {
          alias: 'n',
          type: 'string',
          description: 'Nonce account public key',
          demandOption: true,
        });
    },
    (argv) => {
      solTransfer(argv.sender,argv.recipient, argv.nonce, argv.amount);
    }
  )
  .command(
    'token-transfer',
    'Construct an unsigned SPL Token transfer transaction',
    (yargs) => {
      return yargs
        .option('sender', {
          alias: 's',
          type: 'string',
          description: 'Sender public key (cold wallet, owner of source ATA)',
          demandOption: true,
        })
        .option('recipient', {
          alias: 'r',
          type: 'string',
          description: 'Recipient public key (owner of destination ATA)',
          demandOption: true,
        })
        .option('mint', {
          alias: 'm',
          type: 'string',
          description: 'Mint public key of the token to transfer',
          demandOption: true,
        })
        .option('amount', {
          alias: 'a',
          type: 'number',
          description: 'Amount of tokens to send (in raw units)',
          demandOption: true,
        })
        .option('nonce', {
          alias: 'n',
          type: 'string',
          description: 'Nonce account public key',
          demandOption: true,
        })
        .option('fee-payer', {
          alias: 'f',
          type: 'string',
          description: 'Public key to pay the transaction fees',
          demandOption: true,
        });
    },
    (argv) => {
      const feePayer = argv.feePayer || argv.sender;
      tokenTransfer(argv.sender, argv.recipient, argv.mint, argv.nonce, feePayer, argv.amount) ;
    }
  )
  .command(
    'create-nonce',
    'Create a new durable nonce account',
    (yargs) => {
      return yargs
        .option('authority', {
          alias: 'a',
          type: 'string',
          description: 'Path to the keypair file that will own the nonce account',
          default: 'cold-wallet.json',
        })
    },
    (argv) => {
      createNonce(argv.authority);
    }
  )

  .demandCommand(1, 'You must provide a command.')
  .help()
  .argv;
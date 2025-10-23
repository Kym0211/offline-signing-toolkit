# ⚠️ WARNING: This project is currently under development
This toolkit aims to provide Solana validators with a secure method for participating in SIMD (Solana Improvement Document) governance voting without exposing their main validator identity key ("hot key") during the voting process.

The core problem being addressed are - 

1. Hot Key Exposure: The current SIMD voting process requires validators to sign vote transactions using their main identity key, which must remain online for consensus operations, increasing security risks.

2. Transaction Expiration: Standard offline signing workflows are difficult on Solana due to the short lifespan (~1-2 minutes) of the recentBlockhash used in transactions, making the manual offline signing process prone to failure.

## Core Components

1. `offline-signer-cli` (Typescript CLI) -

- `construct.ts`: Builds the token transfer transaction using a Durable Nonce and saves the unsigned message.

- `sign.ts`: Runs on an air-gapped machine, loads the Governance Key, signs the message from `construct.ts`, and saves the signature.

- `broadcast.ts`: Runs online, combines the unsigned message and the signature, and broadcasts the transaction.

2. `validator-governance` (Anchor Program):
- Provides instructions for validators to manage their vote delegation.

- Creates an on-chain Program Derived Address (PDA) for each validator, acting as a public registry mapping their Validator ID to their chosen offline Governance Key.

- This registry is intended to be read by vote organizers during the vote token airdrop process.

## CLI Progress (offline-signer-cli)

1. **One-Time Setup (Online)**

- ***create-nonce.ts:***

*Purpose:* To create the Durable Nonce account required for non-expiring offline transactions.

*How it Works:* Takes the validator's Governance Key (the offline key, which needs temporary online access just for this setup and must be funded with SOL) as input. It generates a new keypair for the nonce account itself. It then constructs and sends a transaction containing two instructions: SystemProgram.createAccount (to allocate space and assign ownership to the System Program) and SystemProgram.initializeNonceAccount (to set the nonce authority to the Governance Key).

*Output:* Creates the nonce account on-chain and prints its public key. This public key is needed for the construct.ts script.

2. **Voting Workflow (Online -> Offline -> Online)**

   
- ***construct.ts (Online Machine):***

*Purpose:* To prepare the vote transaction message without signing it.

*Inputs:* Requires the sender pubkey, the Nonce Account Pubkey (from create-nonce.ts), Vote Token Mint Pubkey, Destination Pubkey, and the Amount of tokens to transfer.

*How it Works:*

- Fetches the current nonce value from the specified Nonce Account.

- Determines the source (Governance Key's ATA) and destination (Vote Address's ATA) token accounts.

- Builds the list of instructions: SystemProgram.nonceAdvance (using the Governance Key as authority) followed by createTransferInstruction (for the SPL Token vote).

- Compiles these into a TransactionMessage using the fetched nonce as the recentBlockhash and the Governance Key as the payerKey.

*Output:* Saves the serialized message (as a base64 string) into an unsigned-tx.json file.

*File Transfer (Manual):*

The unsigned-tx.json file is securely transferred (e.g., via USB drive) to the air-gapped machine where the Governance Key's secret is stored.

- ***sign.ts (Air-Gapped Machine):***

*Purpose:* To sign the transaction message securely offline.

Inputs: Requires the unsigned-tx.json file and payer's keypair file (e.g., cold-wallet.json).

*How it Works:*

- Loads the Governance Keypair from its file.

- Loads the base64 message string from unsigned-tx.json.

- Decodes the base64 string back into the message buffer.

- Uses nacl.sign.detached (from tweetnacl) to sign the message buffer with the Governance Key's secret key.

- Encodes the resulting signature bytes as a base64 string.

*Output:* Saves the base64 signature and the Governance Key's public key (for verification) into a signature.json file.

*File Transfer (Manual):*

The signature.json file is securely transferred back to the online machine.

- ***broadcast.ts (Online Machine):***

*Purpose:* To combine the message and signature and send the transaction to the network.

*Inputs:* Requires both unsigned-tx.json and signature.json.

*How it Works:*

- Loads the base64 message from unsigned-tx.json and decodes it.

- Loads the base64 signature and signer public key from signature.json and decodes the signature.

- Deserializes the message buffer back into a VersionedMessage object.

- Creates a VersionedTransaction from the message.

- Assigns the decoded signature bytes directly to the correct index in the transaction.signatures array.

- Serializes the now-signed VersionedTransaction and send the transaction to the RPC endpoint.

- Waits for confirmation using connection.confirmTransaction.

*Output:* Prints the transaction signature and Explorer link upon successful confirmation, or logs errors if it fails simulation or confirmation.

## Conceptual Workflow (Intended Final Product)

- One-Time Setup (Online): Validator uses the UI's "Setup" tab (not yet built) with their connected hot wallet(this is one time setup only) to run the CreateDelegation instruction, registering their offline Governance Key pubkey on-chain.

- Construct Vote (Online): Validator uses the UI's "Vote" tab (OnlineVoter.tsx). They input vote details. The app looks up their delegation, fetches their nonce, constructs the transaction message, and displays it as a QR code.

- Sign Vote (Offline): They load their Governance Key file, scan the QR from step 2, and the app signs the message, displaying the signature as a new QR code.

Broadcast Vote (Online): Validator uses the UI's "Vote" tab again. They scan the signature QR from step 4. The app verifies the signature matches the expected key, combines it with the transaction message, and broadcasts it.

**Again, DO NOT use this toolkit in its current state for any real voting or with sensitive keys.**

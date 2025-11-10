# Offline Signer CLI

This toolkit provides a secure, standalone command-line executable for executing sensitive Solana transactions without exposing your private key to the internet.

It is designed to be run in a secure, air-gapped workflow.

## The Problem
1.  **Private Key Exposure:** Standard wallet workflows require your private key to be on an internet-connected device, increasing security risks for high-value operations.
2.  **Transaction Expiration:** Standard offline signing workflows are difficult on Solana due to the short lifespan (~1-2 minutes) of the `recentBlockhash`, making a manual air-gapped process unreliable.

## The Solution
1.  **Durable Nonces:** We eliminate the `recentBlockhash` problem by using a **Durable Nonce** account. This allows a transaction to be constructed online, signed securely offline, and broadcast hours or days later without expiring.
2.  **Air-Gapped Workflow:** The CLI is a single, standalone executable that can be run on any machine (online or offline) without an internet connection or any dependencies. Your private key *never* touches the internet.
3.  **Standalone Executable:** This tool is packaged as a single binary. There is no need to install Node.js, npm, or any other libraries.

---

## Installation

1.  Go to the [**Releases Page**](https://github.com/Kym0211/offline-signing-toolkit/releases) on this GitHub repository.
2.  Download the executable for your operating system (e.g., `offline-signer-cli-win.exe`, `offline-signer-cli-macos`).
3.  Copy this single executable file to both your online and offline machines (e.g., via a trusted USB drive).

---

## The Workflow

This tool is designed to be run in a 3-step process that moves between your internet-connected (online) and air-gapped (offline) machines.



### Step 1: One-Time Setup (Online)

Before you can use the tool, you need a Durable Nonce account.

1.  **Prepare Your Cold Key:** Use an existing, funded cold key or create a new one (e.g., as a `.json` file) and fund it with a small amount of SOL. This key will be the *authority* for the nonce.
2.  **Create Nonce Account:** On your **online** machine, run the `create-nonce` command. This will create the new nonce account on-chain and save its keypair to a new file.

    ```bash
    ./offline-signer-cli create-nonce --authority <path/to/your-cold-key.json>
    ```
    *This is the only time your cold key needs to be used online to send a transaction.*

### Step 2: Per-Transaction Workflow

This is the process you will repeat for every transaction.

#### A. Construct (Online)
On your **online** machine, run the `sol-transfer` or `token-transfer` command to build your transaction. This creates the `unsigned-tx.json` file.

*Example (SOL Transfer):*
```bash
./offline-signer-cli sol-transfer \
  --sender <SENDER_PUBKEY> \
  --recipient <RECIPIENT_PUBKEY> \
  --amount 0.5 \
  --nonce <YOUR_NONCE_ACCOUNT_PUBKEY>
```
*Output: `unsigned-tx.json` is created.*

#### B. Transfer (Manual)
Copy the following files to your air-gapped machine via USB:
1.  `unsigned-tx.json`
2.  Your `cold-wallet.json` (the key you used as the nonce authority)

#### C. Sign (Offline)
On your **air-gapped** machine, run the `sign` command. It will read your keypair and the unsigned transaction, and create a new file with the signature.

```bash
./offline-signer-cli sign \
  --keypair <path/to/cold-wallet.json> \
  --unsigned <path/to/unsigned-tx.json>
```
*Output: `signature.json` is created.*

#### D. Transfer (Manual)
Copy the `signature.json` file back to your **online** machine via USB.

#### E. Broadcast (Online)
On your **online** machine, run the `broadcast` command. It will read the original message and the new signature, combine them, and send the transaction.

```bash
./offline-signer-cli broadcast \
  --unsigned <path/to/unsigned-tx.json> \
  --signature <path/to/signature.json>
```
*Output: Prints the final Transaction Signature and Explorer link.*

---

## Command Reference

### `create-nonce`
Creates a new Durable Nonce account.
* `--authority <path>`: (Alias: `-a`) Path to the keypair file that will own the nonce. (Default: `cold-wallet.json`)

### `sol-transfer`
Constructs an unsigned SOL transfer.
* `--sender <pubkey>`: (Alias: `-s`) Sender public key (your cold wallet).
* `--recipient <pubkey>`: (Alias: `-r`) Recipient public key.
* `--amount <number>`: (Alias: `-a`) Amount of SOL to send.
* `--nonce <pubkey>`: (Alias: `-n`) Your nonce account public key.

### `token-transfer`
Constructs an unsigned SPL Token transfer.
* `--sender <pubkey>`: (Alias: `-s`) Sender public key (your cold wallet).
* `--recipient <pubkey>`: (Alias: `-r`) Recipient's main public key.
* `--mint <pubkey>`: (Alias: `-m`) The mint address of the token.
* `--amount <number>`: (Alias: `-a`) Amount of tokens (raw units).
* `--nonce <pubkey>`: (Alias: `-n`) Your nonce account public key.
* `--fee-payer <pubkey>`: (Alias: `-f`) Optional. The key to pay fees. (Default: *sender*)

### `sign`
Signs an unsigned transaction message on an offline machine.
* `--unsigned <path>`: (Alias: `-u`) Path to the `unsigned-tx.json` file. (Default: `unsigned-tx.json`)
* `--keypair <path>`: (Alias: `-k`) Path to your cold wallet keypair. (Default: `cold-wallet.json`)

### `broadcast`
Broadcasts a signed transaction to the network.
* `--unsigned <path>`: (Alias: `-u`) Path to the original `unsigned-tx.json` file. (Default: `unsigned-tx.json`)
* `--signature <path>`: (Alias: `-s`) Path to the `signature.json` file. (Default: `signature.json`)

---

---

## ⚠️ Disclaimer
**This toolkit is experimental and has not been tested on Solana mainnet. Use at your own risk. It is intended for development and testing purposes on devnet only for now, will be released in production once proper audited.**

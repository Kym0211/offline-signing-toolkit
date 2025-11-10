// src/create_nonce.ts

import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    PublicKey,
    NONCE_ACCOUNT_LENGTH,
    sendAndConfirmRawTransaction, 
} from '@solana/web3.js';
import * as fs from 'fs';

const RPC_ENDPOINT = "https://api.devnet.solana.com";

export async function createNonce(authorityKeypairFile: string) {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    if (!fs.existsSync(authorityKeypairFile)) {
        console.error(`Error: Authority wallet file not found at '${authorityKeypairFile}'`);
        process.exit(1);
    }
    const keypairFileContents = fs.readFileSync(authorityKeypairFile, 'utf-8');
    const privateKeyBytes = new Uint8Array(JSON.parse(keypairFileContents));
    const authorityKeypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log(`Loaded Authority Key: ${authorityKeypair.publicKey.toBase58()}`);

    const nonceAccountKeypair = Keypair.generate();
    console.log(`New Nonce Account Pubkey: ${nonceAccountKeypair.publicKey.toBase58()}`);

    const tx = new Transaction();
    tx.feePayer = authorityKeypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const rentLamports = await connection.getMinimumBalanceForRentExemption(
        NONCE_ACCOUNT_LENGTH
    );
    console.log(`Rent-exempt lamports needed: ${rentLamports / LAMPORTS_PER_SOL} SOL`);

    tx.add(
        SystemProgram.createAccount({
            fromPubkey: authorityKeypair.publicKey,
            newAccountPubkey: nonceAccountKeypair.publicKey,
            lamports: rentLamports,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId 
        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccountKeypair.publicKey,
            authorizedPubkey: authorityKeypair.publicKey, 
        })
    );

    tx.sign(authorityKeypair, nonceAccountKeypair);

    console.log("Sending transaction to create nonce account...");
    const sig = await sendAndConfirmRawTransaction(
        connection,
        tx.serialize()
    );

    const nonceFileName = "nonce-account.json"
    fs.writeFileSync(nonceFileName, JSON.stringify(Array.from(nonceAccountKeypair.secretKey)));

    console.log(`\n✅ Nonce account created successfully!`);
    console.log(`Signature: ${sig}`);
    console.log(`📄 New nonce keypair saved to: ${nonceFileName}`);
    console.log(`🔑 Nonce Account Pubkey: ${nonceAccountKeypair.publicKey.toBase58()}`);
}
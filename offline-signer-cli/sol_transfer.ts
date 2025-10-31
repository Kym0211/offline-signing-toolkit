import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey, SystemProgram, Transaction, NonceAccount, TransactionMessage } from '@solana/web3.js';
import * as fs from "fs";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const USE_DURABLE_NONCE = true;

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const SENDER_PUBKEY = new PublicKey("12uBq3Qhvd1fJ8JsXoUosmzhnrM59TTGUgtdLru5wBUM");
const NONCE_PUBKEY = new PublicKey("CuGTAtCreyUAMrwWRk8wu2DXWNB2LWC6HWjaaWoh5y4j");
// const FEE_PAYER_PUBKEY = new PublicKey("12uBq3Qhvd1fJ8JsXoUosmzhnrM59TTGUgtdLru5wBUM");

// const VOTE_TOKEN_MINT_PUBKEY = new PublicKey("7u96GpRmguMVh5dGtZfQsi2HwP4Mn3625g7avtFmKnec");
// const VOTE_DESTINATION_PUBKEY = new PublicKey("Dv8EZLYymKDdXnnTuw2M1MD31TjVru5kpnhrk8Ki6wth");
const SOL_AMOUNT = 0.5;

async function main() {
    // const args = process.argv.slice(2);
    // if (args.length !== 2 ){
    //     console.log("Usage: pnpm construct");
    //     process.exit(1);
    // }
    // if (!args[0] || !args[1]) return;
    const recipientPubkey = new PublicKey("A37Mykd9uUDhvPJBkn9VkrzAbjJG2RRH3S8Mh1hps7QL");
    // const amount = 0.5 * LAMPORTS_PER_SOL;

    console.log(`Preparing SOL TRANSFER transaction:`);
    // console.log(`  -> Signer (Gov Key): ${SENDER_PUBKEY.toBase58()}`);
    // console.log(`  -> Token Mint: ${VOTE_TOKEN_MINT_PUBKEY.toBase58()}`);
    // console.log(`  -> Destination: ${VOTE_DESTINATION_PUBKEY.toBase58()}`);
    // console.log(`  -> Amount: ${VOTE_AMOUNT} tokens`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    // const instructions = [];
    let recentBlockhash: string;
    const transaction = new Transaction();

    if (USE_DURABLE_NONCE){
        console.log(`Using durable nonce: ${NONCE_PUBKEY.toBase58()}`);
        const nonceAccountInfo = await connection.getAccountInfo(NONCE_PUBKEY);
        if (!nonceAccountInfo) {
            throw new Error("Nonce account not found. Please create it first...");
        }
        const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

        transaction.add(
            SystemProgram.nonceAdvance({
                noncePubkey: NONCE_PUBKEY,
                authorizedPubkey: SENDER_PUBKEY, // The authority of the nonce account
            }),
            SystemProgram.transfer({
                fromPubkey: SENDER_PUBKEY,
                toPubkey: recipientPubkey,
                lamports: SOL_AMOUNT * LAMPORTS_PER_SOL,
            })
        );
        
        transaction.recentBlockhash = nonceAccount.nonce;
        transaction.feePayer = SENDER_PUBKEY;

        // console.log(`nonce : ${recentBlockhash}`);
    } else{
        const { blockhash } = await connection.getLatestBlockhash();
        recentBlockhash = blockhash; 
    }

    

    // const messageV0 = new TransactionMessage({
    //     payerKey: FEE_PAYER_PUBKEY,
    //     recentBlockhash: recentBlockhash,
    //     instructions: instructions 
    // // }).compileToV0Message();
    const messageV0 = transaction.serializeMessage();

    // const messageBuffer = messageV0.serialize();
    const fileName = 'unsigned-tx.json';
    fs.writeFileSync(fileName, JSON.stringify({
        message: Buffer.from(messageV0).toString('base64') 
    }));

    console.log(`\n✅ VOTE transaction message successfully created!`);
    console.log(`📄 Saved to: ${fileName}`);

}

main().catch(err => {
    console.error(err);
    process.exit(1);
})
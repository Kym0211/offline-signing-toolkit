import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey, SystemProgram, Transaction, NonceAccount, TransactionMessage } from '@solana/web3.js';
import * as fs from "fs";

const USE_DURABLE_NONCE = true;

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const SENDER_PUBKEY = new PublicKey("12uBq3Qhvd1fJ8JsXoUosmzhnrM59TTGUgtdLru5wBUM");
const NONCE_PUBKEY = new PublicKey("2zU8pnY5yKu4Unk2aXZViWB5CxGdzi7MuPTm55y4erZW");
const FEE_PAYER_PUBKEY = new PublicKey("12uBq3Qhvd1fJ8JsXoUosmzhnrM59TTGUgtdLru5wBUM");

const VOTE_TOKEN_MINT_PUBKEY = new PublicKey("4xTW11K4BNqy6MoRV9DFM6MNvS9B7gWRLNcUbzgWWWf3");
const VOTE_DESTINATION_PUBKEY = new PublicKey("Dv8EZLYymKDdXnnTuw2M1MD31TjVru5kpnhrk8Ki6wth");
const VOTE_AMOUNT = 1000000; 

async function main() {
    // const args = process.argv.slice(2);
    // if (args.length !== 2 ){
    //     console.log("Usage: pnpm construct");
    //     process.exit(1);
    // }
    // if (!args[0] || !args[1]) return;
    const recipientPubkey = new PublicKey("A37Mykd9uUDhvPJBkn9VkrzAbjJG2RRH3S8Mh1hps7QL");
    // const amount = 0.5 * LAMPORTS_PER_SOL;

    console.log(`Preparing VOTE transaction:`);
    console.log(`  -> Signer (Gov Key): ${SENDER_PUBKEY.toBase58()}`);
    console.log(`  -> Token Mint: ${VOTE_TOKEN_MINT_PUBKEY.toBase58()}`);
    console.log(`  -> Destination: ${VOTE_DESTINATION_PUBKEY.toBase58()}`);
    console.log(`  -> Amount: ${VOTE_AMOUNT} tokens`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const instructions = [];
    let recentBlockhash: string;
    const transaction = new Transaction();

    if (USE_DURABLE_NONCE){
        console.log(`Using durable nonce: ${NONCE_PUBKEY.toBase58()}`);
        const nonceAccountInfo = await connection.getAccountInfo(NONCE_PUBKEY);
        if (!nonceAccountInfo) {
            throw new Error("Nonce account not found. Please create it first...");
        }
        const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

        instructions.push(
            SystemProgram.nonceAdvance({
                noncePubkey: NONCE_PUBKEY,
                authorizedPubkey: SENDER_PUBKEY 
            }) 
        );
        recentBlockhash = nonceAccount.nonce;

        console.log(`nonce : ${recentBlockhash}`);
    } else{
        const { blockhash } = await connection.getLatestBlockhash();
        recentBlockhash = blockhash; 
    }

    const sourceAta = getAssociatedTokenAddressSync(
        VOTE_TOKEN_MINT_PUBKEY,
        SENDER_PUBKEY 
    );

    const destinationAta = getAssociatedTokenAddressSync(
        VOTE_TOKEN_MINT_PUBKEY,
        VOTE_DESTINATION_PUBKEY 
    );

    console.log(`  -> Your Token Account (Source): ${sourceAta.toBase58()}`);
    console.log(`  -> Vote Token Account (Dest): ${destinationAta.toBase58()}`);

    const [sourceAccountInfo, destinationAccountInfo] = await connection.getMultipleAccountsInfo([
        sourceAta,
        destinationAta
    ]);

    if (sourceAccountInfo === null) {
        console.error(`\n❌ ERROR: Your source token account does not exist.`);
        console.error(`Address: ${sourceAta.toBase58()}`);
        console.error(`This means you have not received the vote tokens yet.`);
        console.error(`Please wait for the airdrop or contact the organizers.`);
        process.exit(1);
    }
    console.log("  -> Source account exists. (You have tokens)");

    if (destinationAccountInfo === null) {
        console.log("  -> WARNING: Destination token account does not exist. Adding instruction to create it...");

        instructions.push(
            createAssociatedTokenAccountInstruction(
                FEE_PAYER_PUBKEY,     
                destinationAta,           
                VOTE_DESTINATION_PUBKEY,
                VOTE_TOKEN_MINT_PUBKEY    
            )
        );
    } else {
        console.log("  -> Destination account exists.");
    }

    instructions.push(
        createTransferInstruction(
            sourceAta,
            destinationAta,
            SENDER_PUBKEY,
            VOTE_AMOUNT 
        )
    );

    const messageV0 = new TransactionMessage({
        payerKey: FEE_PAYER_PUBKEY,
        recentBlockhash: recentBlockhash,
        instructions: instructions 
    }).compileToV0Message();

    const messageBuffer = messageV0.serialize();
    const fileName = 'unsigned-tx.json';
    fs.writeFileSync(fileName, JSON.stringify({
        message: Buffer.from(messageBuffer).toString('base64') 
    }));

    console.log(`\n✅ VOTE transaction message successfully created!`);
    console.log(`📄 Saved to: ${fileName}`);

}

main().catch(err => {
    console.error(err);
    process.exit(1);
})
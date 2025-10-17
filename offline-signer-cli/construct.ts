import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL, NonceAccount } from '@solana/web3.js';
import * as fs from "fs";

const USE_DURABLE_NONCE = true;

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const SENDER_PUBKEY = new PublicKey("Dv8EZLYymKDdXnnTuw2M1MD31TjVru5kpnhrk8Ki6wth");
const NONCE_PUBKEY = new PublicKey("B29PR2UpCExgvn65ENboQxHnRue34AsFiUKGTRWgTDXv");
const FEE_PAYER_PUBKEY = new PublicKey("Dv8EZLYymKDdXnnTuw2M1MD31TjVru5kpnhrk8Ki6wth");

async function main() {
    // const args = process.argv.slice(2);
    // if (args.length !== 2 ){
    //     console.log("Usage: pnpm construct");
    //     process.exit(1);
    // }
    // if (!args[0] || !args[1]) return;
    const recipientPubkey = new PublicKey("A37Mykd9uUDhvPJBkn9VkrzAbjJG2RRH3S8Mh1hps7QL");
    const amount = 0.5 * LAMPORTS_PER_SOL;

    console.log(`Preparing transaction:`);
    console.log(`  -> From: ${SENDER_PUBKEY.toBase58()}`);
    console.log(`  -> To: ${recipientPubkey.toBase58()}`);
    console.log(`  -> Amount: ${amount / LAMPORTS_PER_SOL} SOL`);
    console.log(`  -> Fee Payer: ${FEE_PAYER_PUBKEY.toBase58()}`);
    console.log(`\nConnecting to cluster at ${RPC_ENDPOINT}...`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
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
                authorizedPubkey: SENDER_PUBKEY,
            }),
            SystemProgram.transfer({
                fromPubkey: SENDER_PUBKEY,
                toPubkey: recipientPubkey,
                lamports: amount
            }) 
        );

        transaction.feePayer = FEE_PAYER_PUBKEY;
        transaction.recentBlockhash = nonceAccount.nonce;
    } else{
        console.log("using recent blockhash (expires in ~1 minute!)...");

        const { blockhash } = await connection.getLatestBlockhash();

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: SENDER_PUBKEY,
                toPubkey: recipientPubkey,
                lamports: amount, 
            }) 
        );

        transaction.feePayer = FEE_PAYER_PUBKEY;
        transaction.recentBlockhash = blockhash; 
    }

    const messageToSign = transaction.serializeMessage();

    const fileName = 'unsigned-tx.json';
    fs.writeFileSync(fileName, JSON.stringify({
        message: messageToSign.toString('base64') 
    }));

    console.log(`\n✅ Transaction message successfully created!`);
    console.log(`📄 Saved to: ${fileName}`);
    console.log(`\nNext step: Move '${fileName}' to your air-gapped machine and run 'sign.ts'.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
})
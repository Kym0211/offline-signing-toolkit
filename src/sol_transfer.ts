import { Connection, PublicKey, SystemProgram, Transaction, NonceAccount } from '@solana/web3.js';
import * as fs from "fs";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


const RPC_ENDPOINT = "https://api.devnet.solana.com";

export async function solTransfer(
    sender: string,
    recipient: string,
    nonce: string,
    amount: number,
) {
    const recipientPubkey = new PublicKey(recipient);
    const senderPubkey = new PublicKey(sender);
    const noncePubkey = new PublicKey(nonce);

    console.log(`Preparing SOL TRANSFER transaction:`);
    console.log(`  -> Sender: ${senderPubkey.toBase58()}`);
    console.log(`  -> Recipient: ${recipientPubkey.toBase58()}`);
    console.log(`  -> Amount: ${amount} SOL`);
    console.log(`  -> Nonce Acct: ${noncePubkey.toBase58()}`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    console.log(`Using durable nonce: ${noncePubkey.toBase58()}`);
    const nonceAccountInfo = await connection.getAccountInfo(noncePubkey);
    if (!nonceAccountInfo) {
        throw new Error("Nonce account not found. Please create it first...");
    }
    const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

    const transaction = new Transaction();

    transaction.add(
        SystemProgram.nonceAdvance({
            noncePubkey: noncePubkey,
            authorizedPubkey: senderPubkey,
        }),
        SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: recipientPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );
    
    transaction.recentBlockhash = nonceAccount.nonce;
    transaction.feePayer = senderPubkey;
    
    const messageV0 = transaction.serializeMessage();

    const fileName = 'unsigned-tx.json';
    fs.writeFileSync(fileName, JSON.stringify({
        message: Buffer.from(messageV0).toString('base64') 
    }));

    console.log(`\n✅ Sol TRANSFER transaction message successfully created!`);
    console.log(`📄 Saved to: ${fileName}`);

    return messageV0;

}
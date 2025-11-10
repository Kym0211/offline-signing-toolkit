import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey, SystemProgram, Transaction, NonceAccount, TransactionMessage, TransactionInstruction } from '@solana/web3.js';
import * as fs from "fs";

const USE_DURABLE_NONCE = true;

const RPC_ENDPOINT = "https://api.devnet.solana.com";

export async function tokenTransfer(
    sender: string,
    recipient: string,
    mint: string,
    nonce: string,
    feePayer: string,
    amount: number,
) {
    const senderPubkey = new PublicKey(sender);
    const recipientPubkey = new PublicKey(recipient);
    const mintPubkey = new PublicKey(mint);
    const noncePubkey = new PublicKey(nonce);
    const feePayerPubkey = new PublicKey(feePayer);

    console.log(`Preparing TOKEN TRANSFER transaction:`);
    console.log(`  -> Sender (Signer): ${senderPubkey.toBase58()}`);
    console.log(`  -> Recipient: ${recipientPubkey.toBase58()}`);
    console.log(`  -> Mint: ${mintPubkey.toBase58()}`);
    console.log(`  -> Amount: ${amount} (raw units)`);
    console.log(`  -> Nonce Acct: ${noncePubkey.toBase58()}`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const instructions: TransactionInstruction[] = [];
    let recentBlockhash: string;
    const transaction = new Transaction();

    console.log(`Using durable nonce: ${noncePubkey.toBase58()}`);
    const nonceAccountInfo = await connection.getAccountInfo(noncePubkey);
    if (!nonceAccountInfo) {
        throw new Error("Nonce account not found. Please create it first...");
    }
    const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

    instructions.push(
        SystemProgram.nonceAdvance({
            noncePubkey: noncePubkey,
            authorizedPubkey: senderPubkey 
        })
    );
    
    recentBlockhash = nonceAccount.nonce;

    const sourceAta = getAssociatedTokenAddressSync(
        mintPubkey,
        senderPubkey 
    );

    const destinationAta = getAssociatedTokenAddressSync(
        mintPubkey,
        recipientPubkey 
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
                feePayerPubkey,     
                destinationAta,           
                recipientPubkey,
                mintPubkey    
            )
        );
    } else {
        console.log("  -> Destination account exists.");
    }

    instructions.push(
        createTransferInstruction(
            sourceAta,
            destinationAta,
            senderPubkey,
            amount 
        )
    );

    const messageV0 = new TransactionMessage({
        payerKey: feePayerPubkey,
        recentBlockhash: recentBlockhash,
        instructions: instructions 
    }).compileToV0Message();

    const messageBuffer = messageV0.serialize();
    const fileName = 'unsigned-tx.json';
    fs.writeFileSync(fileName, JSON.stringify({
        message: Buffer.from(messageBuffer).toString('base64') 
    }));

    console.log(`\n✅ TOKEN TRANSFER transaction message successfully created!`);
    console.log(`📄 Saved to: ${fileName}`);
}
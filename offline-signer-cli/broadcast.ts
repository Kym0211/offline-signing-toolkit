import { Connection, Transaction, PublicKey, VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import * as fs from "fs";

const RPC_ENDPOINT = "https://api.devnet.solana.com";

const UNSIGNED_TX_FILE = 'unsigned-tx.json';

const SIGNATURE_FILE = 'signature.json';

async function main() {
    console.log("🚀 Broadcasting Process Initialized...");

    if (!fs.existsSync(UNSIGNED_TX_FILE) || !fs.existsSync(SIGNATURE_FILE)) {
        console.error("Error: Missing required files. Ensure 'unsigned-tx.json' and 'signature.json' are in this directory.");
        process.exit(1);
    }

    const unsignedTxFileContents = fs.readFileSync(UNSIGNED_TX_FILE, 'utf-8');
    const { message } = JSON.parse(unsignedTxFileContents);
    const messageBuffer = Buffer.from(message, 'base64');
    console.log("  -> Loaded transaction message.");

    const signatureFileContents = fs.readFileSync(SIGNATURE_FILE, 'utf-8');
    const { signature, publicKey } = JSON.parse(signatureFileContents);
    const signatureBuffer = Buffer.from(signature, 'base64');
    const signerPublicKey = new PublicKey(publicKey);
    console.log(`  -> Loaded signature for signer: ${signerPublicKey.toBase58()}`);

    const messageV0 = VersionedMessage.deserialize(messageBuffer);
    const transaction = new VersionedTransaction(messageV0);

    // const transaction = Transaction.from(Buffer.concat([
    //     Buffer.alloc(1, 0),
    // ]));

    const signerIndex = transaction.message.staticAccountKeys.findIndex(key => key.equals(signerPublicKey)
    );

    if (signerIndex === -1) {
        throw new Error("Signer not found"); 
    }
    transaction.signatures[signerIndex] = signatureBuffer;

    // transaction.addSignature(signerPublicKey, signatureBuffer);
    // console.log("  -> Signature attached to the transaction.");

    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    console.log("\nBroadcasting to the Solana network...");
    
    const txSignature = await connection.sendRawTransaction(
        transaction.serialize()
    );

    console.log("  -> Transaction sent! Waiting for confirmation...");

    const confirmation = await connection.confirmTransaction(txSignature, 'confirmed');

    if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log(`\n✅ Transaction confirmed!`);
    console.log(`🔗 View on Solana Explorer: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
}

main().catch(err => {
    console.error("\n❌ An error occurred during broadcasting:");
    console.error(err.message);
    process.exit(1);
});
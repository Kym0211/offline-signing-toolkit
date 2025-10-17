import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import * as fs from "fs";

// --- Configuration ---

// The RPC endpoint for the Solana cluster.
const RPC_ENDPOINT = "https://api.devnet.solana.com";

// The file containing the original transaction message.
const UNSIGNED_TX_FILE = 'unsigned-tx.json';

// The file containing the signature from the air-gapped machine.
const SIGNATURE_FILE = 'signature.json';

// --- Main Script ---

async function main() {
    console.log("🚀 Broadcasting Process Initialized...");

    // 1. Check if the required files exist.
    if (!fs.existsSync(UNSIGNED_TX_FILE) || !fs.existsSync(SIGNATURE_FILE)) {
        console.error("Error: Missing required files. Ensure 'unsigned-tx.json' and 'signature.json' are in this directory.");
        process.exit(1);
    }

    // 2. Load the original transaction message.
    const unsignedTxFileContents = fs.readFileSync(UNSIGNED_TX_FILE, 'utf-8');
    const { message } = JSON.parse(unsignedTxFileContents);
    const messageBuffer = Buffer.from(message, 'base64');
    console.log("  -> Loaded transaction message.");

    // 3. Load the signature and the public key of the signer.
    const signatureFileContents = fs.readFileSync(SIGNATURE_FILE, 'utf-8');
    const { signature, publicKey } = JSON.parse(signatureFileContents);
    const signatureBuffer = Buffer.from(signature, 'base64');
    const signerPublicKey = new PublicKey(publicKey);
    console.log(`  -> Loaded signature for signer: ${signerPublicKey.toBase58()}`);

    // 4. Reconstruct the transaction from the original message.
    const transaction = Transaction.from(Buffer.concat([
        Buffer.alloc(1, 0), // Placeholder for signature count
        messageBuffer
    ]));

    // 5. Attach the signature from the air-gapped device.
    transaction.addSignature(signerPublicKey, signatureBuffer);
    console.log("  -> Signature attached to the transaction.");

    // 6. Initialize the connection to the Solana cluster.
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    console.log("\nBroadcasting to the Solana network...");
    
    // 7. Send the raw, fully signed transaction.
    const txSignature = await connection.sendRawTransaction(
        transaction.serialize()
    );

    console.log("  -> Transaction sent! Waiting for confirmation...");

    // 8. Wait for the transaction to be confirmed.
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
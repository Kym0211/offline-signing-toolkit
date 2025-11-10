import { Connection, PublicKey, VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import * as fs from "fs";

const RPC_ENDPOINT = "https://api.devnet.solana.com";

export async function broadcast(unsignedTxFile: string, signatureFile: string) {
    console.log("🚀 Broadcasting Process Initialized...");

    if (!fs.existsSync(unsignedTxFile) || !fs.existsSync(signatureFile)) {
        console.error("Error: Missing required files.");
        process.exit(1);
    }

    const unsignedTxFileContents = fs.readFileSync(unsignedTxFile, 'utf-8');
    const { message } = JSON.parse(unsignedTxFileContents);
    const messageBuffer = Buffer.from(message, 'base64');
    console.log("  -> Loaded transaction message.");

    const signatureFileContents = fs.readFileSync(signatureFile, 'utf-8');
    const { signature, publicKey } = JSON.parse(signatureFileContents);
    const signatureBuffer = Buffer.from(signature, 'base64');
    const signerPublicKey = new PublicKey(publicKey);
    console.log(`  -> Loaded signature for signer: ${signerPublicKey.toBase58()}`);

    const messageV0 = VersionedMessage.deserialize(messageBuffer);
    const transaction = new VersionedTransaction(messageV0);

    const signerIndex = transaction.message.staticAccountKeys.findIndex(key => key.equals(signerPublicKey)
    );

    if (signerIndex === -1) {
        throw new Error("Signer not found"); 
    }
    transaction.signatures[signerIndex] = signatureBuffer;

    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    console.log("\nBroadcasting to the Solana network...");

    try {
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

    } catch (err) {
        console.error("\n❌ An error occurred during broadcasting:");
        console.error(err);
        if (err) {
            console.error(`Broadcasting fail with error: ${err}`);
        }
        process.exit(1);
    }
    
}
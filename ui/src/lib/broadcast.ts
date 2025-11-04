import {
    Connection,
    PublicKey,
    VersionedMessage,
    VersionedTransaction
} from "@solana/web3.js";

const RPC_ENDPOINT = "https://api.devnet.solana.com";

// This is your new "main" function, but for the browser.
// It takes the browser's 'File' objects as input.
export async function broadcastTransaction(
    unsignedTxFile: File,
    signatureFile: File
): Promise<string> { // Returns the transaction signature
    
    // 1. Read both files as text (browser-way)
    const unsignedTxContent = await unsignedTxFile.text();
    const signatureContent = await signatureFile.text();

    // 2. Parse the JSON
    const { message } = JSON.parse(unsignedTxContent);
    const { signature, publicKey } = JSON.parse(signatureContent);

    const messageBuffer = Buffer.from(message, 'base64');
    const signatureBuffer = Buffer.from(signature, 'base64');
    const signerPublicKey = new PublicKey(publicKey);

    // 3. Deserialize the message
    const messageV0 = VersionedMessage.deserialize(messageBuffer);
    
    // 4. Create the VersionedTransaction
    const transaction = new VersionedTransaction(messageV0);
    const signerIndex = transaction.message.staticAccountKeys.findIndex(key => key.equals(signerPublicKey)
    );
    console.log(signerIndex)

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
    

    // 8. Return the signature
    return txSignature;
}
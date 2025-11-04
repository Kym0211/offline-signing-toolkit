
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

// const UNSIGNED_TX_FILE = 'unsigned-tx.json';

const COLD_WALLET_KEYPAIR_FILE = 'cold-wallet.json';
const SIGNATURE_OUTPUT_FILE = 'signature.json';

export async function signMessageOffline( 
    UNSIGNED_TX_FILE: File,
    COLD_WALLET_KEYPAIR_FILE: File
) {
    console.log("Air-Gapped Signing Process Initialized...");

    // if (!fs.existsSync(COLD_WALLET_KEYPAIR_FILE)) {
    //     console.error(`Error: Cold wallet file not found at '${COLD_WALLET_KEYPAIR_FILE}'`);
    //     console.error("Please ensure your keypair file is in the same directory.");
    //     process.exit(1);
    // }

    // const KeypairFileContents = fs.readFileSync(COLD_WALLET_KEYPAIR_FILE, 'utf-8');
    const KeypairFileContents = await COLD_WALLET_KEYPAIR_FILE.text();

    const privateKeyBytes = new Uint8Array(JSON.parse(KeypairFileContents));
    const coldWallet = Keypair.fromSecretKey(privateKeyBytes);
    console.log(`  -> Loaded cold wallet: ${coldWallet.publicKey.toBase58()}`);
    // if (!fs.existsSync(UNSIGNED_TX_FILE)) {
    //     console.error(`Error: Unsigned transaction file not found at '${UNSIGNED_TX_FILE}'`);
    //     process.exit(1);
    // }
    // const unsignedTxFileContents = fs.readFileSync(UNSIGNED_TX_FILE, 'utf-8');
    const unsignedTxFileContents = await UNSIGNED_TX_FILE.text();
    const { message } = JSON.parse(unsignedTxFileContents);
    const messageBuffer = Buffer.from(message, 'base64');

    console.log("  -> Loaded transaction message successfully.");

    // 3. Sign the message with the cold wallet's private key.
    const signature = nacl.sign.detached(messageBuffer, coldWallet.secretKey);
    const signatureBase64 = Buffer.from(signature).toString('base64');

    console.log("  -> Message signed successfully!");

    // 4. Save the signature to the output file.
    // fs.writeFileSync(SIGNATURE_OUTPUT_FILE, JSON.stringify({
    //     signature: signatureBase64,
    //     publicKey: coldWallet.publicKey.toBase58() // Include for convenience
    // }));

    // console.log(`\n✅ Signature saved to: ${SIGNATURE_OUTPUT_FILE}`);
    // console.log(`\nNext step: Move '${SIGNATURE_OUTPUT_FILE}' back to your online machine and run 'broadcast.ts'.`);

    return { signature: signatureBase64, publicKey: coldWallet.publicKey.toBase58()}
}
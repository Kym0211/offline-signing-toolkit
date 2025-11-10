import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import nacl from "tweetnacl";

export function sign(unsignedTxFile: string, coldWalletFile: string) {
    console.log("Air-Gapped Signing Process Initialized...");

    if (!fs.existsSync(coldWalletFile)) {
        console.error(`Error: Cold wallet file not found at '${coldWalletFile}'`);
        process.exit(1);
    }

    const KeypairFileContents = fs.readFileSync(coldWalletFile, 'utf-8');
    const privateKeyBytes = new Uint8Array(JSON.parse(KeypairFileContents));
    const coldWallet = Keypair.fromSecretKey(privateKeyBytes);
    console.log(`  -> Loaded cold wallet: ${coldWallet.publicKey.toBase58()}`);

    const unsignedTxFileContents = fs.readFileSync(unsignedTxFile, 'utf-8');
    const { message } = JSON.parse(unsignedTxFileContents);
    const messageBuffer = Buffer.from(message, 'base64');

    console.log("  -> Loaded transaction message successfully.");

    const signature = nacl.sign.detached(messageBuffer, coldWallet.secretKey);
    const signatureBase64 = Buffer.from(signature).toString('base64');

    console.log("  -> Message signed successfully!");

    const signatureOutputFile = 'signature.json';
    fs.writeFileSync(signatureOutputFile, JSON.stringify({
        signature: signatureBase64,
        publicKey: coldWallet.publicKey.toBase58() 
    }));

    console.log(`\n✅ Signature saved to: ${signatureOutputFile}`);
    console.log(`\nNext step: Move '${signatureOutputFile}' back to your online machine and run 'broadcast.ts'.`);

}

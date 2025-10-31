import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    PublicKey,
    NONCE_ACCOUNT_LENGTH,
    sendAndConfirmRawTransaction, 
} from '@solana/web3.js';
import * as fs from 'fs';

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const GOV_KEY_FILE = 'cold-wallet.json';

async function main() {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    if (!fs.existsSync(GOV_KEY_FILE)) {
        console.error(`Error: Governance wallet file not found at '${GOV_KEY_FILE}'`);
        process.exit(1);
    }
    const keypairFileContents = fs.readFileSync(GOV_KEY_FILE, 'utf-8');
    const privateKeyBytes = new Uint8Array(JSON.parse(keypairFileContents));
    const govKeypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log(`Loaded Governance Key: ${govKeypair.publicKey.toBase58()}`);

    const nonceAccountKeypair = Keypair.generate();
    console.log(`New Nonce Account Pubkey: ${nonceAccountKeypair.publicKey.toBase58()}`);

    const tx = new Transaction();

    tx.feePayer = govKeypair.publicKey;

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    tx.add(
        SystemProgram.createAccount({
            fromPubkey: govKeypair.publicKey,
            newAccountPubkey: nonceAccountKeypair.publicKey,
            lamports: 0.0015 * LAMPORTS_PER_SOL,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId 
        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccountKeypair.publicKey,
            authorizedPubkey: govKeypair.publicKey,
        })
    )

    tx.sign(nonceAccountKeypair, govKeypair);

    const sig = await sendAndConfirmRawTransaction(
        connection,
        tx.serialize({ requireAllSignatures: false }) 
    );

    // const rentLamports = await connection.getMinimumBalanceForRentExemption(
    //     NONCE_ACCOUNT_LENGTH
    // );
    // console.log(`Rent-exempt lamports needed: ${rentLamports / LAMPORTS_PER_SOL} SOL`);
}

main().catch(err => {
    console.error("\n❌ Error creating nonce account:");
    console.error(err);
    process.exit(1);
});
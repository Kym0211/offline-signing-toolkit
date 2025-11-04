import { Connection, PublicKey, SystemProgram, Transaction, NonceAccount } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


const RPC_ENDPOINT = "https://api.devnet.solana.com";

export async function solTransfer( 
    sender: string,
    solAmount: number,
    nonce: string,
    recipient: string,
) {
    console.log('transferring sol');
    const recipientPubkey = new PublicKey(recipient);
    const SENDER_PUBKEY = new PublicKey(sender);
    const NONCE_PUBKEY = new PublicKey(nonce);

    // console.log(`Preparing SOL TRANSFER transaction:`);

    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    // const instructions = [];
    let recentBlockhash: string;
    const transaction = new Transaction();

    if (true){
        console.log(`Using durable nonce: ${NONCE_PUBKEY.toBase58()}`);
        const nonceAccountInfo = await connection.getAccountInfo(NONCE_PUBKEY);
        if (!nonceAccountInfo) {
            throw new Error("Nonce account not found. Please create it first...");
        }
        const nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

        transaction.add(
            SystemProgram.nonceAdvance({
                noncePubkey: NONCE_PUBKEY,
                authorizedPubkey: SENDER_PUBKEY, // The authority of the nonce account
            }),
            SystemProgram.transfer({
                fromPubkey: SENDER_PUBKEY,
                toPubkey: recipientPubkey,
                lamports: solAmount * LAMPORTS_PER_SOL,
            })
        );
        
        transaction.recentBlockhash = nonceAccount.nonce;
        transaction.feePayer = SENDER_PUBKEY;

        // console.log(`nonce : ${recentBlockhash}`);
    } else{
        const { blockhash } = await connection.getLatestBlockhash();
        recentBlockhash = blockhash; 
    }

    

    // const messageV0 = new TransactionMessage({
    //     payerKey: FEE_PAYER_PUBKEY,
    //     recentBlockhash: recentBlockhash,
    //     instructions: instructions 
    // // }).compileToV0Message();
    const messageV0 = transaction.serializeMessage();

    // const messageBuffer = messageV0.serialize();
    // const fileName = 'unsigned-tx.json';
    // fs.writeFileSync(fileName, JSON.stringify({
    //     message: Buffer.from(messageV0).toString('base64') 
    // }));

    console.log(`\n✅ VOTE transaction message successfully created!`);
    // console.log(`📄 Saved to: ${fileName}`);

    return Buffer.from(messageV0).toString('base64');

}
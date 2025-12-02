import { Keypair, SystemProgram, Transaction, PublicKey, NONCE_ACCOUNT_LENGTH } from "@solana/web3.js";
import * as fs from "fs";
import { getConnection } from "../utils/connection";
import { saveJson } from "../utils/io";

export async function createNonce(
  env: string,
  payerKeypairPath: string, 
  authorityPubkeyStr: string
) {
  const connection = getConnection(env);
  
  // 1. Load the Hot Wallet (Payer)
  // This wallet must be ONLINE and funded (approx 0.002 SOL is enough)
  if (!fs.existsSync(payerKeypairPath)) {
      throw new Error(`Payer (Hot Wallet) file not found at: ${payerKeypairPath}`);
  }
  const payerSecret = new Uint8Array(JSON.parse(fs.readFileSync(payerKeypairPath, 'utf-8')));
  const payer = Keypair.fromSecretKey(payerSecret);

  const authority = new PublicKey(authorityPubkeyStr);
  const nonceKeypair = Keypair.generate(); // We create a brand new account for the nonce

  console.log(`\nInitializing Durable Nonce on ${env.toUpperCase()}`);
  console.log(`   Payer (Hot):     ${payer.publicKey.toBase58()}`);
  console.log(`   Authority (Cold):${authority.toBase58()}`);
  console.log(`   New Nonce Acct:  ${nonceKeypair.publicKey.toBase58()}`);

  // 2. Calculate Rent
  const minRent = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
  
  // 3. Build Transaction
  const tx = new Transaction();
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: nonceKeypair.publicKey,
      lamports: minRent,
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    SystemProgram.nonceInitialize({
      noncePubkey: nonceKeypair.publicKey,
      authorizedPubkey: authority,
    })
  );

  // 4. Sign and Send (Only Payer signs here!)
  try {
      const txId = await connection.sendTransaction(tx, [payer, nonceKeypair]);
      console.log(`\nNonce Account Created!`);
      console.log(`Tx Signature: ${txId}`);
      
      saveJson("nonce-account.json", {
        address: nonceKeypair.publicKey.toBase58(),
        authority: authority.toBase58(),
        network: env
      });
      console.log(`\nNEXT STEP: You can now use this nonce address in your transfer commands.`);
      
  } catch (error) {
      console.error("\nFailed to create nonce account:", error);
  }
}
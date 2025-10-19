import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ValidatorGovernance } from "../target/types/validator_governance";
import { assert } from "chai";

describe("validator_governance", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ValidatorGovernance as Program<ValidatorGovernance>;

    // Create keypairs to represent our actors for all tests.
    const validatorIdentity = anchor.web3.Keypair.generate();
    const newGovernanceKey = anchor.web3.Keypair.generate();

    // Variable to hold the address of our delegation account PDA.
    let delegationPda: anchor.web3.PublicKey;

    before(async () => {
        // Airdrop SOL once before all tests.
        const airdropSignature = await provider.connection.requestAirdrop(
            validatorIdentity.publicKey,
            2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropSignature);

        // Calculate the PDA address before the tests run.
        [delegationPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("delegation"), validatorIdentity.publicKey.toBuffer()],
            program.programId
        );
    });

    it("Creates a delegation account!", async () => {
        // --- Call our `create_delegation` instruction ---
        await program.methods
            .createDelegation(newGovernanceKey.publicKey)
            .accounts({
                delegationAccount: delegationPda,
                validatorIdentity: validatorIdentity.publicKey,
            })
            .signers([validatorIdentity])
            .rpc();

        // --- Verification ---
        const accountData = await program.account.governanceDelegate.fetch(delegationPda);
        assert.ok(accountData.validatorIdentity.equals(validatorIdentity.publicKey));
        console.log("\n✅ Test 1 Passed: Delegation account created successfully.");
    });

    it("Revokes a delegation account!", async () => {
        // --- Call our `revoke_delegation` instruction ---
        await program.methods
            .revokeDelegation()
            .accounts({
                delegationAccount: delegationPda,
                validatorIdentity: validatorIdentity.publicKey,
            })
            .signers([validatorIdentity])
            .rpc();

        // --- Verification ---
        // This is the crucial part. We try to fetch the account again.
        // Because the account has been closed, this fetch **should fail**.
        // If it fails, our program worked correctly.
        try {
            await program.account.governanceDelegate.fetch(delegationPda);
            // If the line above does NOT throw an error, something went wrong.
            assert.fail("The account should have been closed, but it was still found.");
        } catch (error) {
            // We expect an error here, which means the test passed.
            // We check that the error message confirms the account is not found.
            assert.include(error.message, "Account does not exist");
        }
        
        console.log("✅ Test 2 Passed: Delegation account successfully closed and verified.");
    });
});
use anchor_lang::prelude::*;

use crate::state::GovernanceDelegate;

#[derive(Accounts)]
pub struct CreateDelegation<'info> {
    // This is the account we are creating.
    // 'init' tells Anchor to create it.
    // 'payer' specifies who pays the rent for the account (the validator).
    // 'space' allocates the memory needed for the account on the blockchain.
    //    8 bytes for discriminator + 32 for validator_identity + 32 for governance_key + 1 for bump
    // 'seeds' defines how to derive this account's address (PDA). This ensures
    //    that each validator can only have one delegation account.
    #[account(
        init,
        payer = validator_identity,
        space = 8 + 32 + 32 + 1,
        seeds = [b"delegation".as_ref(), validator_identity.key().as_ref()],
        bump
    )]
    pub delegation_account: Account<'info, GovernanceDelegate>,

    // The validator's main identity key.
    // 'mut' makes the account mutable because it will be debited for rent.
    // 'signer' is a constraint that ensures this transaction was signed by this key.
    #[account(mut)]
    pub validator_identity: Signer<'info>,

    // The Solana System Program, required by Anchor for creating accounts.
    pub system_program: Program<'info, System>,
}

impl<'info> CreateDelegation<'info> {
    pub fn create_delegation_handler(&mut self, governance_key: Pubkey, bumps: CreateDelegationBumps) -> Result<()> {
        // Access the account we are creating from the context.
        let delegation_account = &mut self.delegation_account;
        
        // Populate the fields of our new on-chain account.
        delegation_account.validator_identity = *self.validator_identity.key;
        delegation_account.governance_key = governance_key;
        delegation_account.bump = bumps.delegation_account;

        msg!("Delegation account created for: {}", delegation_account.validator_identity);
        msg!("Governance key set to: {}", delegation_account.governance_key);
        Ok(())
    }
}
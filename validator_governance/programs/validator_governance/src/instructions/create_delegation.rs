use anchor_lang::prelude::*;

use crate::state::GovernanceDelegate;

#[derive(Accounts)]
pub struct CreateDelegation<'info> {
    #[account(
        init,
        payer = validator_identity,
        space = 8 + 32 + 32 + 1,
        seeds = [b"delegation".as_ref(), validator_identity.key().as_ref()],
        bump
    )]
    pub delegation_account: Account<'info, GovernanceDelegate>,

    #[account(mut)]
    pub validator_identity: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateDelegation<'info> {
    pub fn create_delegation_handler(&mut self, governance_key: Pubkey, bumps: CreateDelegationBumps) -> Result<()> {
        let delegation_account = &mut self.delegation_account;
        
        delegation_account.validator_identity = *self.validator_identity.key;
        delegation_account.governance_key = governance_key;
        delegation_account.bump = bumps.delegation_account;

        msg!("Delegation account created for: {}", delegation_account.validator_identity);
        msg!("Governance key set to: {}", delegation_account.governance_key);
        Ok(())
    }
}
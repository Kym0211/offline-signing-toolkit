use anchor_lang::prelude::*;

use crate::state::GovernanceDelegate;

#[derive(Accounts)]
pub struct RevokeDelegation<'info> {
        #[account(mut)]
        pub validator_identity: Signer<'info>,
        
        #[account(
            mut,
            close = validator_identity,
            has_one = validator_identity
        )]
        pub delegation_account: Account<'info, GovernanceDelegate>,
    }

impl<'info> RevokeDelegation<'info> {
    pub fn revoke_delegation_handler(&mut self) -> Result<()> {
        Ok(())
    }
}
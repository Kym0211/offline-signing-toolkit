use anchor_lang::prelude::*;

use crate::state::GovernanceDelegate;

#[derive(Accounts)]
pub struct RevokeDelegation<'info> {
    // We specify the delegation account we want to close.
    // 'mut' is required because closing an account modifies it.
    // 'close = validator_identity' tells Anchor to transfer the account's rent (SOL)
    // to the validator_identity account upon closing.
    // 'has_one = validator_identity' is a security constraint. It checks that the
    // `validator_identity` field stored inside the delegation_account matches the
    // public key of the `validator_identity` signer. This prevents a random person
    // from closing someone else's delegation.
    #[account(
        mut,
        close = validator_identity,
        has_one = validator_identity
    )]
    pub delegation_account: Account<'info, GovernanceDelegate>,

    // The validator's main identity key. This must be the signer to authorize the revocation.
    #[account(mut)]
    pub validator_identity: Signer<'info>,
}

impl<'info> RevokeDelegation<'info> {
    pub fn revoke_delegation_handler(&mut self) -> Result<()> {
        Ok(())
    }
}
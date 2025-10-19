use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GovernanceDelegate {
    // The validator's main identity public key.
    pub validator_identity: Pubkey,
    // The new, less-sensitive key authorized to vote.
    pub governance_key: Pubkey,
    // The bump seed for the PDA, which allows our program to sign transactions.
    pub bump: u8,
}
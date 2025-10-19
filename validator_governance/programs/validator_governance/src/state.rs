use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GovernanceDelegate {
    pub validator_identity: Pubkey,
    pub governance_key: Pubkey,
    pub bump: u8,
}
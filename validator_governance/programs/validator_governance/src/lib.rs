#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;
use spl_governance::state::vote_record::Vote;

declare_id!("HwA9L25ttH6SBuFJt2QWj68S1htkueosbBCwef38tT5R");

pub mod state;
pub mod instructions;

pub use instructions::*;

#[program]
pub mod validator_governance {

    use super::*;

    pub fn create_delegation(ctx: Context<CreateDelegation>, governance_key: Pubkey) -> Result<()> {
        ctx.accounts.create_delegation_handler(governance_key, ctx.bumps)
    }

    pub fn revoke_delegation(ctx: Context<RevokeDelegation>) -> Result<()> {
        ctx.accounts.revoke_delegation_handler()
    }

    pub fn execute_vote_as_delegate(ctx: Context<ExecuteVoteAsDelegate>, vote: Vote) -> Result<()> {
        ctx.accounts.execute_vote_as_delegate_handler(vote)
    }
}

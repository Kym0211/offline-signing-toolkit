use anchor_lang::prelude::*;
use spl_governance::state::vote_record::Vote;

use crate::state::GovernanceDelegate;
use spl_governance::instruction::{cast_vote, CastVote};

#[derive(Accounts)]
pub struct ExecuteVoteAsDelegate<'info> {
    // Our program's accounts for validation
    #[account(
        seeds = [b"delegation".as_ref(), validator_identity.key().as_ref()],
        bump = delegation_account.bump,
        has_one = validator_identity,
        has_one = governance_key
    )]
    pub delegation_account: Account<'info, GovernanceDelegate>,
    
    /// CHECK: This is the validator's main identity. We check it via the `has_one` constraint
    /// on the delegation_account. It is NOT a signer here; our PDA signs for it.
    pub validator_identity: AccountInfo<'info>,

    // The delegate key, which MUST be the signer for this transaction.
    #[account(mut)]
    pub governance_key: Signer<'info>,

    // SPL Governance accounts required for the CPI
    /// CHECK: These are validated by the SPL Governance program itself.
    pub governance: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub proposal: AccountInfo<'info>,
    /// CHECK:
    pub proposal_owner_record: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub voter_token_owner_record: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub vote_record: AccountInfo<'info>,
    
    /// CHECK: The SPL Governance program address.
    pub spl_governance_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> ExecuteVoteAsDelegate<'info> {
    pub fn execute_vote_as_delegate_handler(&mut self, vote: Vote) -> Result<()> {
        msg!("Executing vote as delegate...");

        // Define the seeds for our PDA. This proves our program has authority.
        let validator_identity_key = self.validator_identity.key();
        let seeds = &[
            b"delegation".as_ref(),
            validator_identity_key.as_ref(),
            &[self.delegation_account.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Create the CPI context for calling the SPL Governance program.
        let cpi_ctx = CpiContext::new_with_signer(
            self.spl_governance_program.to_account_info(),
            CastVote {
                governance: self.governance.to_account_info(),
                proposal: self.proposal.to_account_info(),
                proposal_owner_record: self.proposal_owner_record.to_account_info(),
                voter_token_owner_record: self.voter_token_owner_record.to_account_info(),
                governance_authority: self.validator_identity.to_account_info(), // The PDA is acting as the validator
                vote_record: self.vote_record.to_account_info(),
                payer: self.governance_key.to_account_info(),
                system_program: self.system_program.to_account_info(),
            },
            signer_seeds,
        );
        
        // Make the actual CPI call to cast the vote.
        cast_vote(cpi_ctx, vote)?;

        msg!("Vote cast successfully by delegate!");Ok(())
    }
}
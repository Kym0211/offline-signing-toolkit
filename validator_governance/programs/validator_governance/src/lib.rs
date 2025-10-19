use anchor_lang::prelude::*;

declare_id!("HwA9L25ttH6SBuFJt2QWj68S1htkueosbBCwef38tT5R");

#[program]
pub mod validator_governance {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

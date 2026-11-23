use std::process::ExitCode;

use rs_design_tokens::cli::run_cli;

fn main() -> ExitCode {
    match run_cli(std::env::args().skip(1)) {
        Ok(output) => {
            print!("{output}");
            ExitCode::SUCCESS
        }
        Err(err) => {
            eprintln!("error: {err}");
            ExitCode::FAILURE
        }
    }
}

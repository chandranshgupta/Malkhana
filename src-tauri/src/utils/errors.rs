use thiserror::Error;
use serde::{Serialize, Serializer};

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Lock error: {0}")]
    Lock(String),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    
    #[error("Authentication failed: {0}")]
    Auth(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Vault error: {0}")]
    Vault(String),

    #[error("General error: {0}")]
    General(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl From<String> for AppError {
    fn from(err: String) -> Self {
        AppError::General(err)
    }
}

impl From<&str> for AppError {
    fn from(err: &str) -> Self {
        AppError::General(err.to_string())
    }
}

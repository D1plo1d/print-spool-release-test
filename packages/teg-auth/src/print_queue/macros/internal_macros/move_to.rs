use std::sync::Arc;
use std::collections::HashMap;
// use futures::prelude::*;
// use futures::future;
use serde::{Deserialize, Serialize};
// use serde_json::json;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use crate::{
    Context,
};

use super::MoveMacro;
use super::AnnotatedGCode;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MoveToMacro {
    positions: HashMap<String, f32>,
    #[serde(default)]
    feedrate: Option<f32>,
    #[serde(default)]
    sync: bool,
}

impl MoveToMacro {
    pub fn key() -> &'static str { "moveBy" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['position'],
    //         properties: {
    //           positions: {
    //             type: 'object',
    //             additionalProperties: { type: 'number' },
    //           },
    //           feedrate: {
    //             type: 'number',
    //           },
    //           sync: {
    //             type: 'boolean',
    //           },
    //         },
    //     })
    // }

    /// example useage: { moveTo: { positions: { [id]: 100 } } }
    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let move_macro = MoveMacro {
            axes: self.positions.clone(),
            feedrate: self.feedrate,
            sync: self.sync,
            allow_extruder_axes: false,
            relative_movement: false,
        };

        move_macro.compile(ctx).await
    }
}

// #![type_length_limit="15941749"]
#[macro_use] extern crate tracing;
// #[macro_use] extern crate derive_new;
// #[macro_use] extern crate nanoid;

#[cfg(not(target_env = "msvc"))]
use jemallocator::Jemalloc;

#[cfg(not(target_env = "msvc"))]
#[global_allocator]
static ALLOC: Jemalloc = Jemalloc;

// The file `built.rs` was placed there by cargo and `build.rs`
#[allow(dead_code)]
mod built_info {
    include!(concat!(env!("OUT_DIR"), "/built.rs"));
}

pub use teg_machine::paths;

pub mod mutation;
pub mod query;
pub mod server_query;
pub mod local_http_server;
pub mod server;

mod create_db;
pub use create_db::create_db;

pub mod health_check_socket;
pub use health_check_socket::health_check_socket;

pub use teg_auth;
pub use teg_device;
pub use teg_machine;
pub use teg_material;
pub use teg_print_queue;

pub type Db = sqlx::PgPool;
pub type DbId = teg_json_store::DbId;

pub type AppSchemaBuilder = async_graphql::SchemaBuilder<
    query::Query,
    mutation::Mutation,
    async_graphql::EmptySubscription
>;

pub type AppSchema = async_graphql::Schema<
    query::Query,
    mutation::Mutation,
    async_graphql::EmptySubscription
>;

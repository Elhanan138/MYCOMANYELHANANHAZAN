export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize the database on server startup
    const { initDb } = await import("./db/index");
    initDb();
    console.log("[paperclip] Database initialized at ./data/paperclip.db");
  }
}

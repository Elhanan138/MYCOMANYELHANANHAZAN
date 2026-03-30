export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDb } = await import("./db/index");
    await initDb();
    console.log("[paperclip] Database ready");
  }
}

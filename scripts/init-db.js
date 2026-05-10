const { execSync } = require("child_process");

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Migrations applied successfully");
} catch (e) {
  console.error("Migration failed:", e.message);
}

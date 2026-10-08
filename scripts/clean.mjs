import fs from "fs";

try {
  if (fs.existsSync(".next")) {
    fs.rmSync(".next", { recursive: true, force: true });
  }
} catch (e) {
  // Ignore permission locks
}

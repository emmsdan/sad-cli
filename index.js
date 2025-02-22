#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Function to log folder structure
const logStructure = (dir, prefix = "") => {
  if (!fs.existsSync(dir)) return;
  console.log(`${prefix}${path.basename(dir)}/`);
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      logStructure(fullPath, `${prefix}-- `);
    } else {
      console.log(`${prefix}-- ${file}`);
    }
  });
};

// Function to prompt user confirmation
const confirmDelete = (filePath) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`⚠️ Are you sure you want to delete "${filePath}"? (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
};

// Function to search and delete matching files or folders
const searchAndDelete = async (dir, target, ignoreList = []) => {
  if (!fs.existsSync(dir)) return;

  let files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    // Skip ignored files/folders
    if (ignoreList.includes(file)) {
      console.log(`🔹 Ignoring: ${fullPath}`);
      continue;
    }

    if (stats.isDirectory()) {
      if (file === target) {
        const confirmed = await confirmDelete(fullPath);
        if (confirmed) {
          console.log(`🗑️  Deleting folder: ${fullPath}`);
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      } else {
        // If the folder is in the ignore list, skip scanning inside
        if (!ignoreList.includes(file)) {
          await searchAndDelete(fullPath, target, ignoreList);
        }
      }
    } else if (file === target) {
      const confirmed = await confirmDelete(fullPath);
      if (confirmed) {
        console.log(`🗑️  Deleting file: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  }
};

// Exportable function for Node.js projects
const sadCli = async (folder, name, ignores = []) => {
  console.log("📂 Scanning Directory:");
  logStructure(folder);
  await searchAndDelete(folder, name, ignores);
  console.log("✅ Search & deletion process completed.");
};

// Check if the script is run directly (CLI mode)
if (require.main === module) {
  const [,, folder, name, ...ignores] = process.argv;

  if (!folder || !name) {
    console.error("❌ Usage: sad-cli <folder-path> <name-to-delete> [ignore1 ignore2 ...]");
    process.exit(1);
  }

  sadCli(folder, name, ignores).then(() => process.exit(0));
}

module.exports = sadCli;

#!/usr/bin/env node
const { styleText } = require("util");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function colorTrace(msg, color) {
  console.log(styleText(color, msg));

  // console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}
// Function to prompt user confirmation
const confirmDelete = (filePath, question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const qrs =
      question ||
      `⚠️ Are you sure you want to delete "${filePath}"? (yes/no): `;
    rl.question(qrs, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
};
const deleted = [];
const ignored = [];
const alreadyScanned = [];
// Function to search and delete matching files or folders
const searchAndDelete = async (dir, targets, ignoreList = []) => {
  if (ignoreList.includes(path.basename(dir))) {
    colorTrace(`Skipping ignored folder: ${dir}`, "white");
    return;
  }
  if (!fs.existsSync(dir)) return;

  let files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    colorTrace(`Scanning:`, ["doubleunderline", "blueBright"]);
    colorTrace(`... ${fullPath}`, ["framed", "blue"]);

    // Skip ignored files/folders
    if (ignoreList.includes(file)) {
      colorTrace(`🔹 Ignoring: ${fullPath}`, "white");
      ignored.push(fullPath);
      continue;
    }

    if (stats.isDirectory()) {
      alreadyScanned.push(fullPath);

      if (targets.includes(file)) {
        const confirmed = await confirmDelete(fullPath);
        if (confirmed) {
          colorTrace(`🗑️  Deleting folder: ${fullPath}`, ["bold", "red"]);
          fs.rmSync(fullPath, { recursive: true, force: true });
          colorTrace(`🗑️  Deleted folder: ${fullPath}`, [
            "bold",
            "framed",
            "red",
          ]);
          deleted.push(fullPath);
        }
      } else {
        // If the folder is in the ignore list, skip scanning inside
        if (!ignoreList.includes(file)) {
          await searchAndDelete(fullPath, targets, ignoreList);
        }
      }
    } else if (targets.includes(file)) {
      const confirmed = await confirmDelete(fullPath);
      if (confirmed) {
        colorTrace(`🗑️  Deleting folder: ${fullPath}`, "red");
        fs.unlinkSync(fullPath);
        colorTrace(`🗑️  Deleted folder: ${fullPath}`, [
          "bold",
          "framed",
          "red",
        ]);
        deleted.push(fullPath);
      }
    }
  }
};

// Exportable function for Node.js projects
const sadCli = async (folder, name, ignoresDefault = []) => {
  const ignores = [...ignoresDefault, '.git']
  colorTrace("📂 Setting update Directory:", "bgGreenBright");
  (() => {
    try {
      const alreadyScanned = fs.readFileSync("sad-sli.temp", {}).toJSON() || [];
      ignores.push(...alreadyScanned);
    } catch (error) {}
  })();
  colorTrace("📂 Scanning Directory:", "bgGreenBright");

  await searchAndDelete(folder, name, ignores);
  colorTrace(`✅ Ignored ${ignored.length} files/folders.`, "bgGreenBright");
  colorTrace(`🥵🤬👺 Deleted ${deleted.length} files/folders.`, "bgRedBright");
  colorTrace("✅ Search & deletion process completed.", "bgBlueBright");
};

// Check if the script is run directly (CLI mode)
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    colorTrace(
      "❌ Usage: npx sad-cli <folder-path> <name-to-delete1> <name-to-delete2> ... --ignore <ignore1> <ignore2> ...",
      "red"
    );
    process.exit(1);
  }

  const ignoreIndex = args.indexOf("--ignore");
  const dir = args[0];
  const targets =
    ignoreIndex !== -1 ? args.slice(1, ignoreIndex) : args.slice(1);
  const ignoreList = ignoreIndex !== -1 ? args.slice(ignoreIndex + 1) : [];
  if (ignoreList.length < 1) {
    confirmDelete(
      "",
      "Delete all targets, You did not specify an ignore list. Do you want to continue? (yes/no)"
    )
      .catch(() => {
        colorTrace("✅ Safely stop", "green");
        process.exit(0);
      })
      .then(() => {
        sadCli(dir, targets, ignoreList).then(() => {
          colorTrace("✅ Scan complete. Exiting.", "green");
          process.exit(0);
        });
      });
    return;
  }
  sadCli(dir, targets, ignoreList)
    .then(() => {
      colorTrace("✅ Scan complete. Exiting.", "green");
      process.exit(0);
    })
    .catch((e) => {
      colorTrace(
        `✅ Ignored ${ignored.length} files/folders.`,
        "bgGreenBright"
      );
      colorTrace(`🥵🤬👺 Deleted ${deleted.length} files/folders.`, [
        "redBright",
        "bold",
      ]);
      colorTrace("✅ Search & deletion process error.", [
        "bgRed",
        "white",
        "bold",
      ]);
      console.log(e.message);
    })
    .finally(() => {
      fs.writeFileSync("sad-sli.temp", JSON.stringify(alreadyScanned));
      colorTrace("✅ Save already scanned folders.", ["bgBlue", "red", "bold"]);
    });
}

module.exports = sadCli;

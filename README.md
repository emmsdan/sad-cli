# sad-cli 🔍🗑️  

**Search and Delete CLI** (SAD-CLI) is a simple **Node.js** tool that allows you to search for files/folders and delete them interactively.

## 📌 Installation  

Run it **without installing**:  
```sh
npx sad-cli <folder-path> <name-to-delete1> <name-to-delete2> ... --ignore <ignore1> <ignore2> ...
```
Or install it **globally**:
```sh
npm install -g sad-cli
```
Or install it in a **Node.js project**:

```sh
npm install sad-cli
```
## 🚀 Usage

### 1️⃣ CLI Mode

```
sad-cli <folder-path> <name-to-delete1> <name-to-delete2> ... --ignore <ignore1> <ignore2> ...
```
Examples
1️⃣ Delete test.txt but ignore important.txt
```sh
npx sad-cli /path/to/folder test.txt test.mp3 --ignore important.txt important2.pdf
```
2️⃣ Delete node_modules but ignore essential_modules
```sh
npx sad-cli ./my-project node_modules --ignore essential_modules
```

### 2️⃣ Node.js Module Mode
```javascript
const sadCli = require("sad-cli");

(async () => {
  await sadCli("./my-folder", ["old-file.txt"], ["important-folder"]);
})();
```

## 🔹 Features

- ✅ Logs directory structure before scanning
- ✅ Skips ignored files/folders
- ✅ Does not scan inside ignored folders
- ✅ Prompts confirmation before deletion

MIT Licensed | 
Author: [EmmsDan](https://x.com/emmsdan)

# sad-cli

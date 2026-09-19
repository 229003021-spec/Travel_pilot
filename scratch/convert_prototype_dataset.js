import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const workbook = XLSX.readFile("India_Travel_Prototype_Dataset.xlsx");

const serverDir = path.join(process.cwd(), "server/data/prototype_dataset");
const clientDir = path.join(process.cwd(), "client/src/data/prototype_dataset");

if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });
if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

const masterData = {};

workbook.SheetNames.forEach((sheetName) => {
  if (sheetName === "README") return;

  const sheet = workbook.Sheets[sheetName];
  let data = XLSX.utils.sheet_to_json(sheet);

  // Filter out placeholder/example rows
  data = data.filter((row) => {
    const rowStr = JSON.stringify(row).toLowerCase();
    return !rowStr.includes("example place") && !rowStr.includes("delete this row");
  });

  masterData[sheetName] = data;

  const fileName = `${sheetName.toLowerCase()}.json`;
  fs.writeFileSync(path.join(serverDir, fileName), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(clientDir, fileName), JSON.stringify(data, null, 2));

  console.log(`Exported ${data.length} records for sheet "${sheetName}" to ${fileName}`);
});

fs.writeFileSync(path.join(serverDir, "master_prototype.json"), JSON.stringify(masterData, null, 2));
fs.writeFileSync(path.join(clientDir, "master_prototype.json"), JSON.stringify(masterData, null, 2));

console.log("All sheets successfully parsed and installed into server & client data stores!");

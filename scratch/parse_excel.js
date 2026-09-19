import XLSX from "xlsx";
import fs from "fs";

const workbook = XLSX.readFile("India_Top_500_Tourist_Destinations.xlsx");
console.log("Sheet Names:", workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet);
console.log("Total Records:", data.length);
console.log("Headers:", Object.keys(data[0] || {}));
console.log("\nSample 5 Records:");
console.log(data.slice(0, 5));

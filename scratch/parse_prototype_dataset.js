import XLSX from "xlsx";

const workbook = XLSX.readFile("India_Travel_Prototype_Dataset.xlsx");
console.log("Sheet Names in India_Travel_Prototype_Dataset.xlsx:", workbook.SheetNames);

workbook.SheetNames.forEach((name) => {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`\n--- Sheet: "${name}" (${data.length} rows) ---`);
  if (data.length > 0) {
    console.log("Headers:", Object.keys(data[0]));
    console.log("Sample 2 Rows:");
    console.log(data.slice(0, 2));
  }
});

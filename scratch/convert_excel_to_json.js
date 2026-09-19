import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const workbook = XLSX.readFile("India_Top_500_Tourist_Destinations.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet);

const parsedDestinations = rawData.map((row, index) => {
  const destName = row["Destination"] ? String(row["Destination"]).trim() : "";
  const state = row["State / UT"] ? String(row["State / UT"]).trim() : "";
  const region = row["Region"] ? String(row["Region"]).trim() : "";
  const type = row["Type"] ? String(row["Type"]).trim() : "";
  const attractionsStr = row["Famous Attractions"] ? String(row["Famous Attractions"]) : "";
  const attractions = attractionsStr.split(";").map((s) => s.trim()).filter(Boolean);

  const monumentsStr = row["Monuments / Heritage"] ? String(row["Monuments / Heritage"]) : "";
  const monuments = monumentsStr.split(";").map((s) => s.trim()).filter(Boolean);

  const foodStr = row["Food / Restaurants"] ? String(row["Food / Restaurants"]) : "";
  const food = foodStr.split(";").map((s) => s.trim()).filter(Boolean);

  const nature = row["Nature"] && row["Nature"] !== "—" ? String(row["Nature"]).trim() : "";
  const activitiesStr = row["Activities"] ? String(row["Activities"]) : "";
  const activities = activitiesStr.split(";").map((s) => s.trim()).filter(Boolean);

  const shopping = row["Shopping"] && row["Shopping"] !== "—" ? String(row["Shopping"]).trim() : "";
  const specialExp = row["Special Experience"] && row["Special Experience"] !== "—" ? String(row["Special Experience"]).trim() : "";
  const bestSeason = row["Best Season"] ? String(row["Best Season"]).trim() : "Oct–Mar";
  const idealStayDays = row["Ideal Stay (days)"] ? Number(row["Ideal Stay (days)"]) || 2 : 2;

  return {
    id: `dest_${index + 1}_${destName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    name: destName,
    state,
    region,
    type,
    attractions,
    monuments,
    food,
    nature,
    activities,
    shopping,
    specialExperience: specialExp,
    bestSeason,
    idealStayDays,
  };
});

fs.writeFileSync(
  path.join(process.cwd(), "server/data/top500_destinations.json"),
  JSON.stringify(parsedDestinations, null, 2)
);

console.log(`Successfully converted ${parsedDestinations.length} destinations to server/data/top500_destinations.json`);

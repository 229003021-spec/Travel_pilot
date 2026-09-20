import top15Destinations from "../data/top15_destinations.json";

export interface ParsedTripPrompt {
  destination: string;
  origin?: string;
  days: number;
  startDate: string;
  endDate: string;
  travellers: { adults: number; children: number; elderly: number };
  budget: { total: number; currency: string };
  interests: string[];
  preferences: { pace: "relaxed" | "balanced" | "packed"; walking: string; dayStart: string; dayEnd: string; tier: string };
  confidence: number;
}

const CITY_ALIAS_MAP: Record<string, string> = {
  delhi: "Delhi",
  "new delhi": "Delhi",
  jaipur: "Jaipur",
  agra: "Agra",
  varanasi: "Varanasi",
  kashi: "Varanasi",
  banaras: "Varanasi",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  chennai: "Chennai",
  madras: "Chennai",
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  kolkata: "Kolkata",
  calcutta: "Kolkata",
  kochi: "Kochi",
  cochin: "Kochi",
  mysuru: "Mysuru",
  mysore: "Mysuru",
  goa: "Goa",
  leh: "Leh",
  hampi: "Hampi",
  munnar: "Munnar",
  rameswaram: "Rameswaram",
  rameshwaram: "Rameswaram",
  mathura: "Mathura",
  vrindavan: "Vrindavan",
  lucknow: "Lucknow",
  prayagraj: "Prayagraj",
  allahabad: "Prayagraj"
};

export function parseNaturalLanguagePrompt(prompt: string): ParsedTripPrompt {
  // Strip commas for easy numeric parsing ("40,000" -> "40000")
  const cleanPrompt = prompt.replace(/,/g, "");
  const pLower = cleanPrompt.toLowerCase();

  // 1. Destination Extraction
  let destination = "Jaipur"; // default
  let foundDest = false;

  for (const d of top15Destinations) {
    const dName = d.name.toLowerCase();
    if (pLower.includes(dName)) {
      destination = d.name;
      foundDest = true;
      break;
    }
  }

  if (!foundDest) {
    for (const [alias, canonical] of Object.entries(CITY_ALIAS_MAP)) {
      if (pLower.includes(alias)) {
        destination = canonical;
        foundDest = true;
        break;
      }
    }
  }

  // 2. Origin Extraction ("from Delhi", "from Mumbai", etc.)
  let origin: string | undefined = undefined;
  const fromMatch = pLower.match(/from\s+([a-zA-Z\s]+?)(?=\s+for|\s+under|\s+with|\s+\d|\.|$)/);
  if (fromMatch && fromMatch[1]) {
    const rawOrigin = fromMatch[1].trim().toLowerCase();
    origin = CITY_ALIAS_MAP[rawOrigin] || rawOrigin.charAt(0).toUpperCase() + rawOrigin.slice(1);
  }

  // 3. Duration / Days Extraction
  let days = 3;
  const dayMatch = pLower.match(/(\d+)\s*(?:-| )?(?:day|days|d\b)/);
  if (dayMatch && dayMatch[1]) {
    days = parseInt(dayMatch[1], 10);
  } else if (pLower.includes("week") || pLower.includes("7 days")) {
    days = 7;
  } else if (pLower.includes("weekend")) {
    days = 2;
  }

  days = Math.max(1, Math.min(14, days));

  const today = new Date();
  today.setDate(today.getDate() + 14);
  const startDate = today.toISOString().split("T")[0];
  const endDateObj = new Date(today);
  endDateObj.setDate(endDateObj.getDate() + (days - 1));
  const endDate = endDateObj.toISOString().split("T")[0];

  // 4. Travelers Extraction
  let adults = 2;
  let children = 0;

  if (pLower.includes("solo")) {
    adults = 1;
  } else if (pLower.includes("couple")) {
    adults = 2;
  } else {
    const peopleMatch = pLower.match(/(\d+)\s*(?:people|person|pax|travelers|adults)/);
    if (peopleMatch && peopleMatch[1]) {
      adults = parseInt(peopleMatch[1], 10);
    }
  }

  const childMatch = pLower.match(/(\d+)\s*(?:child|children|kids)/);
  if (childMatch && childMatch[1]) {
    children = parseInt(childMatch[1], 10);
  }

  // 5. Budget Extraction
  let budgetAmount = 25000;
  const budgetKMatch = pLower.match(/(?:under|budget|₹|\$|inr)\s*(\d+)\s*k\b/i);
  const budgetFullMatch = pLower.match(/(?:under|budget|₹|\$|inr)\s*(\d{4,6})/i);

  if (budgetKMatch && budgetKMatch[1]) {
    budgetAmount = parseInt(budgetKMatch[1], 10) * 1000;
  } else if (budgetFullMatch && budgetFullMatch[1]) {
    budgetAmount = parseInt(budgetFullMatch[1], 10);
  } else {
    budgetAmount = Math.max(15000, days * 5000 * (adults + children));
  }

  // 6. Interests Extraction
  const interests: string[] = [];
  const interestKeywords = [
    { word: "heritage", tag: "Heritage" },
    { word: "palace", tag: "Heritage" },
    { word: "fort", tag: "Heritage" },
    { word: "temple", tag: "Spiritual" },
    { word: "spiritual", tag: "Spiritual" },
    { word: "food", tag: "Food" },
    { word: "culinary", tag: "Food" },
    { word: "nature", tag: "Nature" },
    { word: "beach", tag: "Beach" },
    { word: "coastal", tag: "Beach" },
    { word: "shopping", tag: "Shopping" },
    { word: "adventure", tag: "Adventure" },
    { word: "trekking", tag: "Adventure" },
  ];

  interestKeywords.forEach((ik) => {
    if (pLower.includes(ik.word) && !interests.includes(ik.tag)) {
      interests.push(ik.tag);
    }
  });

  if (interests.length === 0) {
    interests.push("Sightseeing", "Heritage", "Food");
  }

  // 7. Pace
  let pace: "relaxed" | "balanced" | "packed" = "balanced";
  if (pLower.includes("relaxed") || pLower.includes("slow") || pLower.includes("chill")) {
    pace = "relaxed";
  } else if (pLower.includes("packed") || pLower.includes("fast") || pLower.includes("intense")) {
    pace = "packed";
  }

  return {
    destination,
    origin,
    days,
    startDate,
    endDate,
    travellers: { adults, children, elderly: 0 },
    budget: { total: budgetAmount, currency: "INR" },
    interests,
    preferences: {
      pace,
      walking: "medium",
      dayStart: "08:30",
      dayEnd: "20:30",
      tier: budgetAmount < 20000 ? "budget" : budgetAmount > 50000 ? "luxury" : "mid"
    },
    confidence: foundDest ? 0.95 : 0.7
  };
}

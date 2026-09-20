import { describe, it, expect } from "vitest";
import { parseNaturalLanguagePrompt } from "../client/src/services/nlpExtractor";

describe("NLP Prompt Extractor", () => {
  it("should extract destination, duration, budget, and travelers from natural language", () => {
    const prompt = "Plan a 4 day relaxed trip to Jaipur from Delhi for 4 people under ₹30,000 with heritage and food";
    const parsed = parseNaturalLanguagePrompt(prompt);

    expect(parsed.destination).toBe("Jaipur");
    expect(parsed.origin).toBe("Delhi");
    expect(parsed.days).toBe(4);
    expect(parsed.travellers.adults).toBe(4);
    expect(parsed.budget.total).toBe(30000);
    expect(parsed.interests).toContain("Heritage");
    expect(parsed.interests).toContain("Food");
    expect(parsed.preferences.pace).toBe("relaxed");
  });

  it("should handle city alias resolution (Kashi -> Varanasi)", () => {
    const prompt = "3-day spiritual trip to Kashi for couple under 20k";
    const parsed = parseNaturalLanguagePrompt(prompt);

    expect(parsed.destination).toBe("Varanasi");
    expect(parsed.days).toBe(3);
    expect(parsed.travellers.adults).toBe(2);
    expect(parsed.budget.total).toBe(20000);
    expect(parsed.interests).toContain("Spiritual");
  });

  it("should handle Goa beach vacation queries", () => {
    const prompt = "5 days in Goa for solo traveler under ₹40,000 with beach and nature";
    const parsed = parseNaturalLanguagePrompt(prompt);

    expect(parsed.destination).toBe("Goa");
    expect(parsed.days).toBe(5);
    expect(parsed.travellers.adults).toBe(1);
    expect(parsed.budget.total).toBe(40000);
    expect(parsed.interests).toContain("Beach");
    expect(parsed.interests).toContain("Nature");
  });
});

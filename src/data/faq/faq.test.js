import { faqItems1, faqItems2 } from "./faq";

describe("FAQ Data", () => {
  test("faqItems1 should be an array with 3 items", () => {
    expect(Array.isArray(faqItems1)).toBe(true);
    expect(faqItems1).toHaveLength(3);
  });

  test("faqItems1 items should have id, question, and answer", () => {
    for (const item of faqItems1) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("question");
      expect(item).toHaveProperty("answer");
      expect(typeof item.id).toBe("number");
      expect(typeof item.question).toBe("string");
      expect(typeof item.answer).toBe("string");
    };
  });

  test("faqItems2 should be an array with 3 items", () => {
    expect(Array.isArray(faqItems2)).toBe(true);
    expect(faqItems2).toHaveLength(3);
  });

  test("faqItems2 items should have id, question, and answer", () => {
    for (const item of faqItems2) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("question");
      expect(item).toHaveProperty("answer");
      expect(typeof item.id).toBe("number");
      expect(typeof item.question).toBe("string");
      expect(typeof item.answer).toBe("string");
    };
  });

  test("faqItems1 questions contain specific text", () => {
    expect(faqItems1[0].question).toContain("¿Qué es Habituo");
    expect(faqItems1[1].question).toContain("¿Puedo personalizar mis hábitos");
  });

  test("faqItems2 questions contain specific text", () => {
    expect(faqItems2[0].question).toContain("¿Necesito conocimientos técnicos");
    expect(faqItems2[2].question).toContain("¿Cómo protege Habituo");
  });
});

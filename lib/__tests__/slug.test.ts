import { describe, it } from "node:test";
import assert from "node:assert";
import { generateSlug, generateUniqueSlug } from "../slug";

describe("generateSlug", () => {
  it("converts to lowercase", () => {
    assert.strictEqual(generateSlug("Hello World"), "hello-world");
    assert.strictEqual(generateSlug("UPPERCASE"), "uppercase");
  });

  it("replaces spaces with hyphens", () => {
    assert.strictEqual(generateSlug("hello world"), "hello-world");
    assert.strictEqual(generateSlug("one two three"), "one-two-three");
  });

  it("removes special characters", () => {
    assert.strictEqual(generateSlug("hello!@#$%world"), "helloworld");
    assert.strictEqual(generateSlug("test&value"), "testvalue");
  });

  it("handles accented characters", () => {
    assert.strictEqual(generateSlug("Café Amsterdam"), "cafe-amsterdam");
    assert.strictEqual(generateSlug("naïve résumé"), "naive-resume");
    assert.strictEqual(generateSlug("über cool"), "uber-cool");
  });

  it("trims leading and trailing hyphens", () => {
    assert.strictEqual(generateSlug("-hello-"), "hello");
    assert.strictEqual(generateSlug("---test---"), "test");
    assert.strictEqual(generateSlug("!hello!"), "hello");
  });

  it("collapses multiple consecutive hyphens", () => {
    assert.strictEqual(generateSlug("hello   world"), "hello-world");
    assert.strictEqual(generateSlug("a--b--c"), "a-b-c");
  });

  it("handles empty and whitespace-only input", () => {
    assert.strictEqual(generateSlug(""), "");
    assert.strictEqual(generateSlug("   "), "");
    assert.strictEqual(generateSlug("!!!"), "");
  });

  it("preserves numbers", () => {
    assert.strictEqual(generateSlug("Test 123"), "test-123");
    assert.strictEqual(generateSlug("2024 Event"), "2024-event");
  });

  it("handles complex real-world titles", () => {
    assert.strictEqual(
      generateSlug("Grand Café 'De Zon' - Amsterdam"),
      "grand-cafe-de-zon-amsterdam"
    );
    assert.strictEqual(
      generateSlug("Restaurant @Downtown (NYC)"),
      "restaurant-downtown-nyc"
    );
  });
});

describe("generateUniqueSlug", () => {
  it("returns base slug when not exists", async () => {
    const checkExists = async () => false;
    const result = await generateUniqueSlug("Test Title", checkExists);
    assert.strictEqual(result, "test-title");
  });

  it("appends -2 suffix when base slug exists", async () => {
    const existingSlugs = new Set(["test-title"]);
    const checkExists = async (slug: string) => existingSlugs.has(slug);
    const result = await generateUniqueSlug("Test Title", checkExists);
    assert.strictEqual(result, "test-title-2");
  });

  it("increments suffix until unique slug found", async () => {
    const existingSlugs = new Set([
      "cafe-amsterdam",
      "cafe-amsterdam-2",
      "cafe-amsterdam-3",
    ]);
    const checkExists = async (slug: string) => existingSlugs.has(slug);
    const result = await generateUniqueSlug("Café Amsterdam", checkExists);
    assert.strictEqual(result, "cafe-amsterdam-4");
  });

  it("handles empty title gracefully", async () => {
    const checkExists = async () => false;
    const result = await generateUniqueSlug("!!!", checkExists);
    assert.strictEqual(result, "item-1");
  });

  it("handles empty title with existing items", async () => {
    const existingSlugs = new Set(["item-1", "item-2"]);
    const checkExists = async (slug: string) => existingSlugs.has(slug);
    const result = await generateUniqueSlug("", checkExists);
    assert.strictEqual(result, "item-3");
  });

  it("properly awaits checkExists function", async () => {
    let callCount = 0;
    const checkExists = async (slug: string) => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 1));
      return slug === "test-slug";
    };
    const result = await generateUniqueSlug("Test Slug", checkExists);
    assert.strictEqual(result, "test-slug-2");
    assert.strictEqual(callCount, 2); // Base slug + "-2"
  });
});

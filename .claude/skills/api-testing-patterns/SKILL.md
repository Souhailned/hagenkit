# API Testing Patterns - Horecagrond

## Stack

- **Playwright** for E2E and API testing
- **Bun test** for unit tests
- **Next.js 16** app router

## API Route Testing

### Direct Route Handler Tests

```typescript
// __tests__/api/properties.test.ts
import { describe, it, expect } from "bun:test";
import { GET, POST } from "@/app/api/properties/route";
import { NextRequest } from "next/server";

describe("Properties API", () => {
  it("GET returns properties list", async () => {
    const req = new NextRequest("http://localhost:3000/api/properties");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST creates property with valid data", async () => {
    const req = new NextRequest("http://localhost:3000/api/properties", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Property",
        address: "Teststraat 1",
        city: "Amsterdam",
      }),
      headers: {
        "Content-Type": "application/json",
        // Mock auth header
        Cookie: "better-auth.session_token=test-session",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("POST rejects invalid data", async () => {
    const req = new NextRequest("http://localhost:3000/api/properties", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

## Playwright E2E Tests

### Setup (`playwright.config.ts`)

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "bun run dev",
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

### Auth Helper

```typescript
// e2e/helpers/auth.ts
import { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}
```

### E2E Test Example

```typescript
// e2e/properties.spec.ts
import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("Properties", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "test@example.com", "password123");
  });

  test("can create a property", async ({ page }) => {
    await page.goto("/dashboard/properties");
    await page.click("text=Nieuw pand");

    await page.fill('input[name="name"]', "Test Pand");
    await page.fill('input[name="address"]', "Kerkstraat 1");
    await page.click("text=Opslaan");

    await expect(page.locator("text=Test Pand")).toBeVisible();
  });
});
```

## Server Action Testing

```typescript
// __tests__/actions/create-property.test.ts
import { describe, it, expect, mock } from "bun:test";

// Mock auth
mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({
        user: { id: "test-user", activeWorkspaceId: "test-ws" },
      }),
    },
  },
}));

import { createProperty } from "@/app/actions/properties";

describe("createProperty", () => {
  it("creates property with valid data", async () => {
    const formData = new FormData();
    formData.set("name", "Test Property");
    formData.set("address", "Teststraat 1");

    const result = await createProperty(formData);
    expect(result.success).toBe(true);
  });
});
```

## Running Tests

```bash
# Unit tests
bun test

# E2E tests
bunx playwright test

# Specific test
bun test __tests__/api/properties.test.ts
bunx playwright test e2e/properties.spec.ts

# With UI
bunx playwright test --ui
```

## Key Rules

1. **Always test auth** — both authenticated and unauthenticated paths
2. **Test validation** — invalid input should return 400, not 500
3. **Use real Prisma** with test database for integration tests
4. **Clean up** — delete test data after each test
5. **Dutch UI text** in E2E selectors (e.g., "Opslaan", "Nieuw pand")

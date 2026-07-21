This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.github/
  workflows/
    ci.yml
data/
  data.zip
drizzle/
  envConfig.ts
scripts/
  addImagesToProducts.ts
  distributeImages.sql
  fill.ts
  generate.ts
  genProducts.ts
  makeImages.ts
  slugify.ts
src/
  app/
    (category-sidebar)/
      [collection]/
        page.tsx
      products/
        [category]/
          [subcategory]/
            [product]/
              opengraph-image.tsx
              page.tsx
            opengraph-image.tsx
            page.tsx
          layout.tsx
          opengraph-image.tsx
          page.tsx
      layout.tsx
      page.tsx
    (login)/
      actions.ts
    api/
      debug/
        route.ts
      prefetch-images/
        [...rest]/
          route.ts
      search/
        route.ts
    order/
      dynamic.tsx
      page.tsx
    order-history/
      dynamic.tsx
      page.tsx
    scan/
      page.tsx
    auth.client.tsx
    auth.server.tsx
    data.ts
    error.tsx
    favicon.ico
    globals.css
    layout.tsx
    not-found.tsx
    opengraph-image.png
    robots.txt
    welcome-toast.tsx
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      label.tsx
      link.tsx
      popover.tsx
      product-card.tsx
      scroll-area.tsx
    add-to-cart-form.tsx
    cart.tsx
    login-form.tsx
    search-dropdown.tsx
  db/
    index.ts
    schema.ts
  lib/
    actions.ts
    cart.ts
    middleware.ts
    queries.ts
    rate-limit.ts
    session.ts
    unstable-cache.ts
    utils.ts
.eslintrc.json
.gitattributes
.gitignore
.prettierignore
components.json
drizzle.config.ts
LICENSE
next.config.mjs
package.json
postcss.config.mjs
prettier.config.cjs
README.md
tailwind.config.ts
tsconfig.json
```

# Files

## File: .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/master' }}

permissions: {}

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        name: Install pnpm
        with:
          run_install: false

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm run lint

  format:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        name: Install pnpm
        with:
          run_install: false

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Format
        run: pnpm run format:check

  typecheck:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        name: Install pnpm
        with:
          run_install: false

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Typecheck
        run: pnpm run typecheck
```

## File: drizzle/envConfig.ts
```typescript
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);
```

## File: scripts/addImagesToProducts.ts
```typescript
import { eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../src/db";
import { categories, products, subcategories } from "../src/db/schema";
import {
  Effect,
  Schedule,
  Console,
  Cause,
  Array,
  Predicate,
  Random,
} from "effect";
import { NodeRuntime } from "@effect/platform-node";

const main = Effect.gen(function* () {
  const categoryUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: categories.image_url })
      .from(categories)
      .where(isNotNull(categories.image_url)),
  );

  const subcategoryUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: subcategories.image_url })
      .from(subcategories)
      .where(isNotNull(subcategories.image_url)),
  );

  const productUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: products.image_url })
      .from(products)
      .where(isNotNull(products.image_url)),
  );

  const allUrls = Array.dedupe(
    Array.filter(
      [
        ...categoryUrls.map((c) => c.imageUrl),
        ...subcategoryUrls.map((s) => s.imageUrl),
        ...productUrls.map((p) => p.imageUrl),
      ],
      Predicate.isNotNull,
    ),
  );

  yield* Effect.log(`Total unqiue image urls found: ${allUrls.length}`);

  const productsWithoutImage = yield* Effect.tryPromise(() =>
    db
      .select({ slug: products.slug })
      .from(products)
      .where(isNull(products.image_url)),
  );

  yield* Effect.log(
    `Products without image urls found: ${productsWithoutImage.length}`,
  );

  yield* Effect.all(
    productsWithoutImage.map((product, i) =>
      Effect.gen(function* () {
        yield* Effect.log(
          `Beginning update for index ${i} of ${productsWithoutImage.length}`,
        );
        const randomImageUrl = yield* Random.choice(allUrls);
        yield* Effect.tryPromise(() =>
          db
            .update(products)
            .set({ image_url: randomImageUrl })
            .where(eq(products.slug, product.slug)),
        );
      }),
    ),
    { mode: "either", concurrency: 10 },
  );
});

NodeRuntime.runMain(main);
```

## File: scripts/distributeImages.sql
```sql
-- Step 1: Create a temporary table of image URLs with a random order and assign a row number
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM categories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM subcategories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM products WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),

-- Step 2: Create a temporary table of products with NULL image_url and assign a random row number
numbered_products AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM products
  WHERE image_url IS NULL
)

-- Step 3: Update products by matching the row numbers modulo the count of image URLs
UPDATE products p
SET image_url = niu.image_url
FROM numbered_products np
JOIN numbered_image_urls niu
  ON ((np.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE p.slug = np.slug;

-- Update categories with NULL image_url
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM categories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM subcategories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM products WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),
numbered_categories AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM categories
  WHERE image_url IS NULL
)
UPDATE categories c
SET image_url = niu.image_url
FROM numbered_categories nc
JOIN numbered_image_urls niu
  ON ((nc.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE c.slug = nc.slug;


-- Update subcategories with NULL image_url
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM categories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM subcategories WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM products WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),
numbered_subcategories AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM subcategories
  WHERE image_url IS NULL
)
UPDATE subcategories sc
SET image_url = niu.image_url
FROM numbered_subcategories nsc
JOIN numbered_image_urls niu
  ON ((nsc.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE sc.slug = nsc.slug;
```

## File: scripts/fill.ts
```typescript
import slugify from "slugify";
import { products, subcategories } from "../src/db/schema";
import { db } from "../src/db";
import { eq, isNull } from "drizzle-orm";

const readline = require("readline");
const fs = require("fs");

const getEmptySubcategories = async () => {
  const subcategoriesWithoutProducts = await db
    .select()
    .from(subcategories)
    .leftJoin(products, eq(products.subcategory_slug, subcategories.slug))
    .where(isNull(products.subcategory_slug));

  return subcategoriesWithoutProducts.map((s) => s.subcategories.slug);
};

function getRandomObjects(arr: any[], count: number) {
  const result = [];
  const takenIndices = new Set();
  const arrLength = arr.length;

  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * arrLength);

    if (!takenIndices.has(randomIndex)) {
      result.push(arr[randomIndex]);
      takenIndices.add(randomIndex);
    }
  }

  return result;
}

const getBody = async () => {
  const fileStream = fs.createReadStream("scripts/out.jsonl");
  const rl = readline.createInterface({
    input: fileStream,
  });

  const body = [] as any[];
  rl.on("line", (line: string) => {
    try {
      const parsedLine = JSON.parse(line);
      const subcategory_slug = parsedLine.custom_id;
      const response = JSON.parse(
        parsedLine.response.body.choices[0].message.content,
      );

      const products = response.products;

      const productsToAdd = products.map(
        (product: { name: string; description: string }) => {
          const price = parseFloat((Math.random() * 20 + 5).toFixed(1));
          return {
            slug: slugify(product.name, { lower: true }),
            name: product.name,
            description: product.description ?? "",
            price,
            subcategory_slug,
          };
        },
      );
      body.push(...productsToAdd);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      fs.appendFile("scripts/errors.txt", line + "\n", (err: any) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  });

  rl.on("close", async () => {
    console.log(body.length);
    for (let i = 0; i < body.length; i += 10000) {
      const chunk = body.slice(i, i + 10000);
      await db.insert(products).values(chunk).onConflictDoNothing();
      console.log(`Inserted products ${i} to ${i + chunk.length}`);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100 ms
    }

    // const data = [] as any[];
    // const subcategories = await getEmptySubcategories();
    // subcategories.forEach((subcat) => {
    //   // get 30 random products from body, regardless of subcategory_slug
    //   const products = getRandomObjects(body, 30).map((product) => {
    //     return {
    //       ...product,
    //       subcategory_slug: subcat,
    //       slug: slugify(product.name, { lower: true }) + "-1",
    //     };
    //   });
    //   data.push(...products);
    // });

    // for (let i = 0; i < data.length; i += 10000) {
    //   const chunk = data.slice(i, i + 10000);
    //   await db.insert(products).values(chunk).onConflictDoNothing();
    //   console.log(`Inserted products ${i} to ${i + chunk.length}`);
    //   await new Promise((resolve) => setTimeout(resolve, 100)); // Delay of 0.1 second
    // }

    // console.log("Inserted products");
  });
};

// getBody();

const duplicateProducts = async () => {
  for (let i = 0; i < 13; i += 1) {
    const p = await db
      .select()
      .from(products)
      .limit(10000)
      .offset(i * 10000);

    const productsToAdd = p.map((product) => {
      return {
        ...product,
        name: product.name + " V2",
        slug: product.slug + "-v2",
      };
    });

    await db.insert(products).values(productsToAdd).onConflictDoNothing();
    console.log(`Inserted products ${i * 10000} to ${(i + 1) * 10000}`);
  }
  console.log("Inserted products");
};

// duplicateProducts();
```

## File: scripts/generate.ts
```typescript
import OpenAI from "openai";
import slugify from "slugify";
import { db } from "../src/db";
import {
  categories,
  collections,
  subcategories,
  subcollections,
} from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
const fs = require("fs");

const openai = new OpenAI();
const client = createOpenAI();

const system = `
You are given the name of a collection for products in an art supply store.
Your task is to generate 20 unique categories for this collection. Make sure the
category names are broad.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Collection Name: Sketching Pencils

OUTPUT:
{ categories: ["Colored Pencils", "Charcoal Pencils", ...] }

Remember, ONLY RETURN THE JSON of 20 unique categories and nothing else.
  
MAKE SURE THERE ARE 20 CATEGORIES IN THE OUTPUT.`;

const getCollections = async () => {
  return await db.select().from(collections);
};

// generate 20 categories per each collection
const generateCategories = async () => {
  const data = [] as any;
  const c = await getCollections();

  const promises = c.map(async (col) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        categories: z.array(z.string()),
      }),
      system,
      prompt: `Collection Name: ${col.name}`,
    });

    const { categories: cats } = object;
    console.log(`Categories generated: ${cats.length}`);

    const categoriesToAdd = cats.map((category: string) => ({
      name: category,
      collection_id: col.id,
      slug: slugify(category, { lower: true }),
    }));
    data.push(...categoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(categories).values(data).onConflictDoNothing();
};

// generateCategories();

const getCategories = async () => {
  return await db.select().from(categories);
};

// generate 10 subcollections per each category
const generateSubCollections = async () => {
  const data = [] as any;
  const c = await getCategories();

  const promises = c.map(async (cat) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        subcollections: z.array(z.string()),
      }),
      system: `You are given the name of a category for products in an art supply store.
                Your task is to generate 10 unique subcollections for this category. Make sure the
                subcollection names are broad.

                YOU MUST OUTPUT IN ONLY JSON.
                
                EXAMPLE:

                INPUT:
                Category Name: Art Hitory

                OUTPUT:
                { subcollections: ["Art History Books", "Art History CDs", ...] }
                
                Remember, ONLY RETURN THE JSON of 10 unique subcollections and nothing else.
                  
                MAKE SURE THERE ARE 10 SUBCOLLECTIONS IN THE OUTPUT.`,
      prompt: `Category Name: ${cat.name}`,
    });

    const { subcollections: sc } = object;
    console.log(`Subcollections generated: ${sc.length}`);

    const categoriesToAdd = sc.map((subcol: string) => ({
      name: subcol,
      category_slug: cat.slug,
    }));
    data.push(...categoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(subcollections).values(data).onConflictDoNothing();
};

// generateSubCollections();

const getSubcollections = async () => {
  // only get subcollections that have no subcategories
  const result = await db
    .select()
    .from(subcollections)
    .leftJoin(
      subcategories,
      eq(subcollections.id, subcategories.subcollection_id),
    )
    .where(isNull(subcategories.subcollection_id))
    .limit(300);
  console.log(result.length);
  return result;
};

const generateSubcategories = async () => {
  const data = [] as any;
  const subcollections = (await getSubcollections()).map(
    (c) => c.subcollections,
  );

  const promises = subcollections.map(async (subcol) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        subcategories: z.array(z.string()),
      }),
      system: `You are given the name of a subcollection of products in an art supply store.
                Your task is to generate 10 unique subcategories that belong to this subcollection.
                Make sure the subcategory names are broad.

                YOU MUST OUTPUT IN ONLY JSON.

                EXAMPLE:

                INPUT:
                Subcollection Name: Art Hitory

                OUTPUT:
                { subcategories: ["Art History Books", "Art History CDs", ...] }

                Remember, ONLY RETURN THE JSON of 10 unique subcategories and nothing else.

                MAKE SURE THERE ARE 10 SUBCATEGORIES IN THE OUTPUT.`,
      prompt: `Subcollection Name: ${subcol}`,
    });

    const { subcategories: sc } = object;
    console.log(`Subcategories generated: ${sc.length}`);

    const subcategoriesToAdd = sc.map((subcat: string) => ({
      name: subcat,
      slug: slugify(subcat, { lower: true }),
      subcollection_id: subcol.id,
    }));
    data.push(...subcategoriesToAdd);
  });

  await Promise.all(promises);
  await db.insert(subcategories).values(data).onConflictDoNothing();
};

// getSubcollections();
// generateSubcategories();

const productSystemMessage = `
You are given the name of a category of products in an art supply store.
Your task is to generate 25 unique products that belong to this category.
Ensure each product has a name and brief description.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Category Name: Paint Markers

OUTPUT:
{ products: [{ name: "Expo Paint Marker", description: "..." }, { name: "Paint Marker Set", description:"..." }] }

Remember, ONLY RETURN THE JSON of 30 unique products and nothing else.
MAKE SURE YOUR JSON IS VALID. ALL JSON MUST BE CORRECT.
`;

const generateBatchFile = async () => {
  const arr = await db.select().from(subcategories);

  arr.forEach((subcat) => {
    const custom_id = subcat.slug;
    const method = "POST";
    const url = "/v1/chat/completions";
    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: productSystemMessage },
        { role: "user", content: `Category name: ${subcat.name}` },
      ],
    };

    const line = `{"custom_id": "${custom_id}", "method": "${method}", "url": "${url}", "body": ${JSON.stringify(body)}}`;

    fs.appendFile("scripts/req.jsonl", line + "\n", (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
};

// generateBatchFile();

const uploadBatchFile = async () => {
  const file = await openai.files.create({
    file: fs.createReadStream("scripts/req.jsonl"),
    purpose: "batch",
  });

  console.log(file);
};

// uploadBatchFile();

const createBatch = async () => {
  const batch = await openai.batches.create({
    input_file_id: "",
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  });

  console.log(batch);
};

// createBatch();

const checkBatchStatus = async () => {
  const batch = await openai.batches.retrieve("");
  console.log(batch);
};

// checkBatchStatus();

const downloadBatch = async () => {
  const fileResponse = await openai.files.content("");
  const fileContents = await fileResponse.text();

  fs.appendFile("scripts/out.jsonl", fileContents, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File has been saved");
  });
};

// downloadBatch();
```

## File: scripts/genProducts.ts
```typescript
import { db } from "../src/db";
import { Effect, Schedule, Console, Cause } from "effect";
import {
  products as products_table,
  categories,
  subcategories as subcategories_table,
  subcategories,
  products,
  subcollections,
} from "../src/db/schema";
import { eq, sql, lt } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import slugify from "slugify";

const productValidator = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
    }),
  ),
});

const categoryValidator = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

const openai = new OpenAI();

const makeProductPrompt = (categoryName: string) => `
  You are given the name of a product category for products in an art supply store.
  Your task is to generate 10 products. Each product has a name, description, and price.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  Category Name: Painting Supplies

  OUTPUT:
  {
    "products": [
      {
        "name": "Acrylic Paints (Basic and Professional Grades)",
        "description": "High-quality, student-grade acrylic paint with smooth consistency.",
        "price": 19.99,
      }, 
    ...
  }

  NOW YOUR TURN,

  INPUT:
  Category Name: ${categoryName}

  OUTPUT:`;

const makeCategoryPrompt = (categoryName: string) => `
  You are given the name of a product category for products in an art supply store.
  Your task is to generate 10 sub-categories. Each sub-category has a name.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  Category Name: Sketching Pencils

  OUTPUT:
  {
    "categories": [
      {
        "name": "Colored Pencils",
      }, 
      {
        "name": "Charcoal Pencils",
      }, 
    ...
  }

  NOW YOUR TURN,

  INPUT:
  Category Name: ${categoryName}

  OUTPUT:`;

const main = Effect.gen(function* () {
  // find subcollections with less than 5 subcategories
  // const subcollectionsWithLessThan5Subcategories = yield* Effect.tryPromise(
  //   () =>
  //     db
  //       .select({
  //         subcollectionId: subcollection.id,
  //         subcollectionName: subcollection.name,
  //         subcategoryCount: sql<number>`COUNT(${subcategories.slug})`,
  //       })
  //       .from(subcollection)
  //       .leftJoin(
  //         subcategories,
  //         eq(subcollection.id, subcategories.subcollection_id),
  //       )
  //       .groupBy(subcollection.id, subcollection.name)
  //       .having(eq(sql<number>`COUNT(${subcategories.slug})`, 0)),
  // );
  // console.log(
  //   `found ${subcollectionsWithLessThan5Subcategories.length} subcollections with no subcategories`,
  // );
  // let counter1 = 0;
  // yield* Effect.all(
  //   subcollectionsWithLessThan5Subcategories.map((coll) =>
  //     Effect.gen(function* () {
  //       console.log(
  //         `starting ${counter1++} of ${subcollectionsWithLessThan5Subcategories.length}`,
  //       );
  //       console.log("starting", coll.subcollectionName);
  //       const res = yield* Effect.tryPromise(() =>
  //         openai.chat.completions.create({
  //           model: "gpt-3.5-turbo",
  //           messages: [
  //             {
  //               role: "user",
  //               content: makeCategoryPrompt(coll.subcollectionName),
  //             },
  //           ],
  //         }),
  //       ).pipe(Effect.tapErrorCause((e) => Console.error("hi", e)));
  //       const text = res.choices[0].message.content;
  //       if (!text) {
  //         return yield* Effect.fail("no json");
  //       }
  //       const json = yield* Effect.try(() => JSON.parse(text));
  //       const res2 = categoryValidator.safeParse(json);
  //       if (!res2.success) {
  //         return yield* Effect.fail("invalid json");
  //       }
  //       yield* Effect.all(
  //         res2.data.categories
  //           .map(
  //             (category) =>
  //               ({
  //                 ...category,
  //                 slug: slugify(category.name),
  //                 subcollection_id: coll.subcollectionId,
  //               }) as const,
  //           )
  //           .map((x) =>
  //             Effect.tryPromise(() => db.insert(subcategories).values(x)).pipe(
  //               Effect.catchAll((e) => Effect.void),
  //             ),
  //           ),
  //       );
  //       console.log("data inserted");
  //     }),
  //   ),
  //   { mode: "either", concurrency: 4 },
  // );
  // // find subcategories withless than 5 products
  const subcategoriesWithLessThan5Products = yield* Effect.tryPromise(() =>
    db
      .select({
        subcategorySlug: subcategories.slug,
        subcategoryName: subcategories.name,
        productCount: sql<number>`COUNT(${products.slug})`,
      })
      .from(subcategories)
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .groupBy(subcategories.slug, subcategories.name)
      .having(eq(sql<number>`COUNT(${products.slug})`, 0)),
  );
  console.log(
    `found ${subcategoriesWithLessThan5Products.length} subcategories with no products`,
  );
  let counter2 = 0;
  yield* Effect.all(
    subcategoriesWithLessThan5Products.map((cat) =>
      Effect.gen(function* () {
        console.log(
          `starting ${counter2++} of ${subcategoriesWithLessThan5Products.length}`,
        );
        console.log("starting", cat.subcategoryName);
        const res = yield* Effect.tryPromise(() =>
          openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: makeProductPrompt(cat.subcategoryName),
              },
            ],
          }),
        );
        const json = res.choices[0].message.content;
        if (!json) {
          return yield* Effect.fail("no json");
        }
        const res2 = productValidator.safeParse(JSON.parse(json));
        if (!res2.success) {
          return yield* Effect.fail("invalid json");
        }
        yield* Effect.all(
          res2.data.products
            .map((product) => ({
              ...product,
              price: product.price.toString(),
              subcategory_slug: cat.subcategorySlug,
              slug: slugify(product.name),
            }))
            .map((x) =>
              Effect.tryPromise(() => db.insert(products).values(x)).pipe(
                Effect.catchAll((e) => Effect.void),
              ),
            ),
          {
            concurrency: 5,
          },
        );
      }),
    ),
    { concurrency: 3 },
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced("1 seconds") })),
);
console.log(exit.toString());
```

## File: scripts/makeImages.ts
```typescript
import { put } from "@vercel/blob";
import { db } from "../src/db";
import { Effect, Schedule } from "effect";
import {
  products as products_table,
  categories as categories_table,
  subcategories as subcategories_table,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

const generateImage = (prompt: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() =>
      fetch("https://api.getimg.ai/v1/stable-diffusion/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GETIMG_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: "blurry",
          width: 512,
          height: 512,
          response_format: "url",
        }),
      }),
    );
    const json = yield* Effect.tryPromise(() => res.json());
    console.log(json);
    return json;
  });
const uploadImage = (imageUrl: string, path: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(imageUrl));
    const blob = yield* Effect.tryPromise(() => res.blob());
    return yield* Effect.tryPromise(() =>
      put(path, blob, { access: "public" }),
    );
  });

const main = Effect.gen(function* () {
  const products = yield* Effect.tryPromise(() =>
    db.query.products.findMany({
      where: (products, { isNull }) => isNull(products.image_url),
    }),
  );
  console.log(`found ${products.length} products`);

  yield* Effect.all(
    products.map((product) =>
      Effect.gen(function* () {
        console.log(`generating image for ${product.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product:
            Product Name: ${product.name}
            Product Description: ${product.description}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${product.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `products/${product.slug}`,
        );
        console.log(`uploaded image for ${product.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(products_table)
            .set({ image_url: url })
            .where(eq(products_table.slug, product.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );

  const categories = yield* Effect.tryPromise(() =>
    db.query.categories.findMany({
      where: (categories, { isNull }) => isNull(categories.image_url),
    }),
  );

  console.log(`found ${categories.length} categories`);

  yield* Effect.all(
    categories.map((category) =>
      Effect.gen(function* () {
        console.log(`generating image for ${category.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product category:
            Category Name: ${category.name}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${category.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `categories/${category.slug}`,
        );
        console.log(`uploaded image for ${category.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(categories_table)
            .set({ image_url: url })
            .where(eq(categories_table.slug, category.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );

  const subcategories = yield* Effect.tryPromise(() =>
    db.query.subcategories.findMany({
      where: (subcategories, { isNull }) => isNull(subcategories.image_url),
    }),
  );

  console.log(`found ${subcategories.length} subcategories`);

  yield* Effect.all(
    subcategories.map((category) =>
      Effect.gen(function* () {
        console.log(`generating image for ${category.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product category:
            Category Name: ${category.name}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${category.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `subcategories/${category.slug}`,
        );
        console.log(`uploaded image for ${category.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(subcategories_table)
            .set({ image_url: url })
            .where(eq(subcategories_table.slug, category.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced("10 seconds") })),
);
console.log(exit.toString());
```

## File: scripts/slugify.ts
```typescript
import { db } from "../src/db";
import slugify from "slugify";
import { collections } from "../src/db/schema";
import { eq } from "drizzle-orm";

const collectionsData = await db.query.collections.findMany();
for (const collection of collectionsData) {
  await db
    .update(collections)
    .set({ slug: slugify(collection.name, { lower: true }) })
    .where(eq(collections.id, collection.id));
}
```

## File: src/app/(category-sidebar)/[collection]/page.tsx
```typescript
import { Link } from "@/components/ui/link";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { getCollectionDetails } from "@/lib/queries";

import Image from "next/image";

export async function generateStaticParams() {
  return await db.select({ collection: collections.slug }).from(collections);
}

export default async function Home(props: {
  params: Promise<{
    collection: string;
  }>;
}) {
  const collectionName = decodeURIComponent((await props.params).collection);

  const collections = await getCollectionDetails(collectionName);
  let imageCount = 0;

  return (
    <div className="w-full p-4">
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                prefetch={true}
                key={category.name}
                className="flex w-[125px] flex-col items-center text-center"
                href={`/products/${category.slug}`}
              >
                <Image
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  decoding="sync"
                  src={category.image_url ?? "/placeholder.svg"}
                  alt={`A small picture of ${category.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  width={48}
                  height={48}
                  quality={65}
                />
                <span className="text-xs">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/[subcategory]/[product]/opengraph-image.tsx
```typescript
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProductDetails } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the product";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    product: string;
    subcategory: string;
    category: string;
  }>;
}) {
  console.log(props);
  const { product } = await props.params;
  const urlDecodedProduct = decodeURIComponent(product);
  const productData = await getProductDetails(urlDecodedProduct);

  if (!productData) {
    notFound();
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              style={{
                width: "300px",
                marginBottom: "30px",
              }}
              src={productData.image_url ?? "/placeholder.svg"}
              alt={productData.name}
            />
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          {productData.name}
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <div
            style={{ textAlign: "center", display: "flex", fontSize: "24px" }}
          >
            {productData.description}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            fontSize: "24px",
            marginTop: "10px",
          }}
        >
          ${productData.price}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/[subcategory]/[product]/page.tsx
```typescript
import { ProductLink } from "@/components/ui/product-card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Metadata } from "next";

import { getProductDetails, getProductsForSubcategory } from "@/lib/queries";
// import { db } from "@/db";

// export async function generateStaticParams() {
//   const results = await db.query.products.findMany({
//     with: {
//       subcategory: {
//         with: {
//           subcollection: {
//             with: {
//               category: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     category: s.subcategory.subcollection.category.slug,
//     subcategory: s.subcategory.slug,
//     product: s.slug,
//   }));
// }

export async function generateMetadata(props: {
  params: Promise<{ product: string; category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { product: productParam } = await props.params;
  const urlDecodedProduct = decodeURIComponent(productParam);

  const product = await getProductDetails(urlDecodedProduct);

  if (!product) {
    return notFound();
  }

  return {
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function Page(props: {
  params: Promise<{
    product: string;
    subcategory: string;
    category: string;
  }>;
}) {
  const { product, subcategory, category } = await props.params;
  const urlDecodedProduct = decodeURIComponent(product);
  const urlDecodedSubcategory = decodeURIComponent(subcategory);
  const [productData, relatedUnshifted] = await Promise.all([
    getProductDetails(urlDecodedProduct),
    getProductsForSubcategory(urlDecodedSubcategory),
  ]);

  if (!productData) {
    return notFound();
  }
  const currentProductIndex = relatedUnshifted.findIndex(
    (p) => p.slug === productData.slug,
  );
  const related = [
    ...relatedUnshifted.slice(currentProductIndex + 1),
    ...relatedUnshifted.slice(0, currentProductIndex),
  ];

  return (
    <div className="container p-4">
      <h1 className="border-t-2 pt-1 text-xl font-bold text-accent1">
        {productData.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Image
            loading="eager"
            decoding="sync"
            src={productData.image_url ?? "/placeholder.svg?height=64&width=64"}
            alt={`A small picture of ${productData.name}`}
            height={256}
            quality={80}
            width={256}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="flex-grow text-base">{productData.description}</p>
        </div>
        <p className="text-xl font-bold">
          ${parseFloat(productData.price).toFixed(2)}
        </p>
        <AddToCartForm productSlug={productData.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="text-lg font-bold text-accent1">
            Explore more products
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related?.map((product) => (
            <ProductLink
              key={product.name}
              loading="lazy"
              category_slug={category}
              subcategory_slug={subcategory}
              product={product}
              imageUrl={product.image_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/[subcategory]/opengraph-image.tsx
```typescript
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getSubcategory } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the subcategory";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}) {
  const { subcategory: subcategoryParam } = await props.params;
  const urlDecodedCategory = decodeURIComponent(subcategoryParam);

  const subcategory = await getSubcategory(urlDecodedCategory);

  if (!subcategory) {
    return notFound();
  }

  const description = `Choose from our selection of ${subcategory.name}. In stock and ready to ship.`;

  // TODO: Change design to add subcategory images that blur out
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              style={{
                width: "300px",
                marginBottom: "30px",
              }}
              src={subcategory.image_url ?? "/placeholder.svg"}
              alt={subcategory.name}
            />
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          {subcategory.name}
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <div
            style={{ textAlign: "center", display: "flex", fontSize: "24px" }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/[subcategory]/page.tsx
```typescript
import { notFound } from "next/navigation";
import { ProductLink } from "@/components/ui/product-card";
import type { Metadata } from "next";
import {
  getProductsForSubcategory,
  getSubcategory,
  getSubcategoryProductCount,
} from "@/lib/queries";
// import { db } from "@/db";

// export async function generateStaticParams() {
//   const results = await db.query.subcategories.findMany({
//     with: {
//       subcollection: {
//         with: {
//           category: true,
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     category: s.subcollection.category.slug,
//     subcategory: s.slug,
//   }));
// }

export async function generateMetadata(props: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { subcategory: subcategoryParam } = await props.params;
  const urlDecodedCategory = decodeURIComponent(subcategoryParam);

  const [subcategory, rows] = await Promise.all([
    getSubcategory(urlDecodedCategory),
    getSubcategoryProductCount(urlDecodedCategory),
  ]);

  if (!subcategory) {
    return notFound();
  }

  const description = rows[0]?.count
    ? `Choose from over ${rows[0]?.count - 1} products in ${subcategory.name}. In stock and ready to ship.`
    : undefined;

  return {
    openGraph: { title: subcategory.name, description },
  };
}

export default async function Page(props: {
  params: Promise<{
    subcategory: string;
    category: string;
  }>;
}) {
  const { subcategory, category } = await props.params;
  // const urlDecodedCategory = decodeURIComponent(category);
  const urlDecodedSubcategory = decodeURIComponent(subcategory);
  const [products, countRes] = await Promise.all([
    getProductsForSubcategory(urlDecodedSubcategory),
    getSubcategoryProductCount(urlDecodedSubcategory),
  ]);

  if (!products) {
    return notFound();
  }

  const finalCount = countRes[0]?.count;
  return (
    <div className="container mx-auto p-4">
      {finalCount > 0 ? (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      ) : (
        <p>No products for this subcategory</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {products.map((product) => (
          <ProductLink
            key={product.name}
            loading="eager"
            category_slug={category}
            subcategory_slug={subcategory}
            product={product}
            imageUrl={product.image_url}
          />
        ))}
      </div>
    </div>
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/layout.tsx
```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const urlDecoded = decodeURIComponent(categoryParam);
  const category = await getCategory(urlDecoded);

  if (!category) {
    return notFound();
  }

  const examples = category.subcollections
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ")
    .toLowerCase();

  return {
    title: `${category.name}`,
    openGraph: {
      title: `${category.name}`,
      description: `Choose from our selection of ${category.name.toLowerCase()}, including ${examples + (category.subcollections.length > 1 ? "," : "")} and more. In stock and ready to ship.`,
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
```

## File: src/app/(category-sidebar)/products/[category]/opengraph-image.tsx
```typescript
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the category";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category: categoryParam } = await props.params;
  const urlDecodedCategory = decodeURIComponent(categoryParam);

  const category = await getCategory(urlDecodedCategory);

  if (!category) {
    return notFound();
  }

  const examples = category.subcollections
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ");

  const description = `Choose from our selection of ${category.name}, including ${examples + (category.subcollections.length > 1 ? "," : "")} and more. In stock and ready to ship.`;

  // TODO: Change design to add subcategory images that blur out
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              style={{
                width: "300px",
                marginBottom: "30px",
              }}
              src={category.image_url ?? "/placeholder.svg"}
              alt={category.name}
            />
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          {category.name}
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <div
            style={{ textAlign: "center", display: "flex", fontSize: "24px" }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
```

## File: src/app/(category-sidebar)/products/[category]/page.tsx
```typescript
import Image from "next/image";
import { Link } from "@/components/ui/link";
import { notFound } from "next/navigation";
import { getCategory, getCategoryProductCount } from "@/lib/queries";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function generateStaticParams() {
  return await db.select({ category: categories.slug }).from(categories);
}

export default async function Page(props: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category } = await props.params;
  const urlDecoded = decodeURIComponent(category);
  const cat = await getCategory(urlDecoded);
  if (!cat) {
    return notFound();
  }

  const countRes = await getCategoryProductCount(urlDecoded);

  const finalCount = countRes[0]?.count;

  return (
    <div className="container p-4">
      {finalCount && (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      )}
      <div className="space-y-4">
        {cat.subcollections.map((subcollection, index) => (
          <div key={index}>
            <h2 className="mb-2 border-b-2 text-lg font-semibold">
              {subcollection.name}
            </h2>
            <div className="flex flex-row flex-wrap gap-2">
              {subcollection.subcategories.map(
                (subcategory, subcategoryIndex) => (
                  <Link
                    prefetch={true}
                    key={subcategoryIndex}
                    className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                    href={`/products/${category}/${subcategory.slug}`}
                  >
                    <div className="py-2">
                      <Image
                        loading="eager"
                        decoding="sync"
                        src={subcategory.image_url ?? "/placeholder.svg"}
                        alt={`A small picture of ${subcategory.name}`}
                        width={48}
                        height={48}
                        quality={65}
                        className="h-12 w-12 flex-shrink-0 object-cover"
                      />
                    </div>
                    <div className="flex h-16 flex-grow flex-col items-start py-2">
                      <div className="text-sm font-medium text-gray-700 group-hover:underline">
                        {subcategory.name}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## File: src/app/(category-sidebar)/layout.tsx
```typescript
import { Link } from "@/components/ui/link";
import { getCollections } from "@/lib/queries";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allCollections = await getCollections();
  return (
    <div className="flex flex-grow font-mono">
      <aside className="fixed left-0 hidden w-64 min-w-64 max-w-64 overflow-y-auto border-r p-4 md:block md:h-full">
        <h2 className="border-b border-accent1 text-sm font-semibold text-accent1">
          Choose a Category
        </h2>
        <ul className="flex flex-col items-start justify-center">
          {allCollections.map((collection) => (
            <li key={collection.slug} className="w-full">
              <Link
                prefetch={true}
                href={`/${collection.slug}`}
                className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
              >
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4 pt-0 md:pl-64"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
```

## File: src/app/(category-sidebar)/page.tsx
```typescript
import { Link } from "@/components/ui/link";
import { getCollections, getProductCount } from "@/lib/queries";

import Image from "next/image";

export default async function Home() {
  const [collections, productCount] = await Promise.all([
    getCollections(),
    getProductCount(),
  ]);
  let imageCount = 0;

  return (
    <div className="w-full p-4">
      <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
        Explore {productCount.at(0)?.count.toLocaleString()} products
      </div>
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                prefetch={true}
                key={category.name}
                className="flex w-[125px] flex-col items-center text-center"
                href={`/products/${category.slug}`}
              >
                <Image
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  decoding="sync"
                  src={category.image_url ?? "/placeholder.svg"}
                  alt={`A small picture of ${category.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  width={48}
                  height={48}
                  quality={65}
                />
                <span className="text-xs">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## File: src/app/(login)/actions.ts
```typescript
"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { validatedAction } from "@/lib/middleware";
import { db } from "@/db";
import { NewUser, users } from "@/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/session";
import { authRateLimit, signUpRateLimit } from "@/lib/rate-limit";

const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const signUp = validatedAction(authSchema, async (data) => {
  const { username, password } = data;
  const ip = (await headers()).get("x-real-ip") ?? "local";
  const rl2 = await signUpRateLimit.limit(ip);
  if (!rl2.success) {
    return {
      error: {
        code: "AUTH_ERROR",
        message: "Too many signups. Try again later",
      },
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: "Username already taken. Please try again." };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    username,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: "Failed to create user. Please try again." };
  }
  await setSession(createdUser);
});

export const signIn = validatedAction(authSchema, async (data) => {
  const { username, password } = data;
  const ip = (await headers()).get("x-real-ip") ?? "local";
  const rl = await authRateLimit.limit(ip);

  if (!rl.success) {
    return {
      error: {
        code: "AUTH_ERROR",
        message: "Too many attempts. Try again later",
      },
    };
  }
  const user = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length === 0) {
    return { error: "Invalid username or password. Please try again." };
  }

  const { user: foundUser } = user[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return { error: "Invalid username or password. Please try again." };
  }
  await setSession(foundUser);
});

export async function signOut() {
  // clear session & cart
  const c = await cookies();
  c.getAll().forEach((cookie) => c.delete(cookie.name));
}
```

## File: src/app/api/debug/route.ts
```typescript
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // dump all the request headers, cookies, and body, infinite deep json stringify
  const stringifyHeaders = JSON.stringify(
    Object.fromEntries(request.headers),
    null,
    2,
  );
  const cookieStore = (await cookies()).getAll();
  const stringifyCookies = JSON.stringify(cookieStore, null, 2);

  console.log("headers", stringifyHeaders);
  console.log("cookies", stringifyCookies);
  const responseObj = {
    headers: stringifyHeaders,
    cookies: stringifyCookies,
  };

  return Response.json(responseObj);
}
```

## File: src/app/api/prefetch-images/[...rest]/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";

export const dynamic = "force-static";

function getHostname() {
  if (process.env.NODE_ENV === "development") {
    return "localhost:3000";
  }
  if (process.env.VERCEL_ENV === "production") {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  return process.env.VERCEL_BRANCH_URL;
}

export async function GET(
  _: NextRequest,
  { params }: { params: { rest: string[] } },
) {
  const schema = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = getHostname();
  if (!host) {
    return new Response("Failed to get hostname from env", { status: 500 });
  }
  const href = (await params).rest.join("/");
  if (!href) {
    return new Response("Missing url parameter", { status: 400 });
  }
  const url = `${schema}://${host}/${href}`;
  const response = await fetch(url);
  if (!response.ok) {
    return new Response("Failed to fetch", { status: response.status });
  }
  const body = await response.text();
  const { document } = parseHTML(body);
  const images = Array.from(document.querySelectorAll("main img"))
    .map((img) => ({
      srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
      sizes: img.getAttribute("sizes"),
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      loading: img.getAttribute("loading"),
    }))
    .filter((img) => img.src);
  return NextResponse.json(
    { images },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
```

## File: src/app/api/search/route.ts
```typescript
import { getSearchResults } from "@/lib/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // format is /api/search?q=term
  const searchTerm = request.nextUrl.searchParams.get("q");
  if (!searchTerm || !searchTerm.length) {
    return Response.json([]);
  }

  const results = await getSearchResults(searchTerm);

  const searchResults: ProductSearchResult = results.map((item) => {
    const href = `/products/${item.categories.slug}/${item.subcategories.slug}/${item.products.slug}`;
    return {
      ...item.products,
      href,
    };
  });
  const response = Response.json(searchResults);
  // cache for 10 minutes
  response.headers.set("Cache-Control", "public, max-age=600");
  return response;
}

export type ProductSearchResult = {
  href: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string;
  price: string;
  subcategory_slug: string;
}[];
```

## File: src/app/order/dynamic.tsx
```typescript
import { cache } from "react";
import { detailedCart } from "@/lib/cart";
import { Link } from "@/components/ui/link";
import Image from "next/image";
import { removeFromCart } from "@/lib/actions";
import { X } from "lucide-react";

const getCartItems = cache(() => detailedCart());
type CartItem = Awaited<ReturnType<typeof getCartItems>>[number];

export async function CartItems() {
  const cart = await getCartItems();
  return (
    <>
      {cart.length > 0 && (
        <div className="pb-4">
          <p className="font-semibold text-accent1">Delivers in 2-4 weeks</p>
          <p className="text-sm text-gray-500">Need this sooner?</p>
        </div>
      )}
      {cart.length > 0 ? (
        <div className="flex flex-col space-y-10">
          {cart.map((item) => (
            <CartItem key={item.slug} product={item} />
          ))}
        </div>
      ) : (
        <p>No items in cart</p>
      )}
    </>
  );
}
function CartItem({ product }: { product: CartItem }) {
  if (!product) {
    return null;
  }
  // limit to 2 decimal places
  const cost = (Number(product.price) * product.quantity).toFixed(2);
  return (
    <div className="flex flex-row items-center justify-between border-t border-gray-200 pt-4">
      <Link
        prefetch={true}
        href={`/products/${product.subcategory.subcollection.category_slug}/${product.subcategory.slug}/${product.slug}`}
      >
        <div className="flex flex-row space-x-2">
          <div className="flex h-24 w-24 items-center justify-center bg-gray-100">
            <Image
              loading="eager"
              decoding="sync"
              src={product.image_url ?? "/placeholder.svg"}
              alt="Product"
              width={256}
              height={256}
              quality={80}
            />
          </div>
          <div className="max-w-[100px] flex-grow sm:max-w-full">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm md:text-base">{product.description}</p>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-center md:space-x-10">
        <div className="flex flex-col-reverse md:flex-row md:gap-4">
          <p>{product.quantity}</p>
          <div className="flex md:block">
            <div className="min-w-8 text-sm md:min-w-24 md:text-base">
              <p>${Number(product.price).toFixed(2)} each</p>
            </div>
          </div>
          <div className="min-w-24">
            <p className="font-semibold">${cost}</p>
          </div>
        </div>
        <form action={removeFromCart}>
          <button type="submit">
            <input type="hidden" name="productSlug" value={product.slug} />
            <X className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export async function TotalCost() {
  const cart = await getCartItems();

  const totalCost = cart.reduce(
    (acc, item) => acc + item.quantity * Number(item.price),
    0,
  );

  return <span> ${totalCost.toFixed(2)}</span>;
}
```

## File: src/app/order/page.tsx
```typescript
import { Metadata } from "next";
import { Suspense } from "react";
import { CartItems, TotalCost } from "./dynamic";
import { PlaceOrderAuth } from "../auth.server";

export const metadata: Metadata = {
  title: "Order",
};

export default async function Page() {
  return (
    <main className="min-h-screen sm:p-4">
      <div className="container mx-auto p-1 sm:p-3">
        <div className="flex items-center justify-between border-b border-gray-200">
          <h1 className="text-2xl text-accent1">Order</h1>
        </div>

        <div className="flex grid-cols-3 flex-col gap-8 pt-4 lg:grid">
          <div className="col-span-2">
            <Suspense>
              <CartItems />
            </Suspense>
          </div>

          <div className="space-y-4">
            <div className="rounded bg-gray-100 p-4">
              <p className="font-semibold">
                Merchandise{" "}
                <Suspense>
                  <TotalCost />
                </Suspense>
              </p>
              <p className="text-sm text-gray-500">
                Applicable shipping and tax will be added.
              </p>
            </div>
            <Suspense>
              <PlaceOrderAuth />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
```

## File: src/app/order-history/dynamic.tsx
```typescript
import { getUser } from "@/lib/queries";

export async function OrderHistoryDynamic() {
  const user = await getUser();
  return user ? (
    <div className="border-t border-gray-200 pt-4">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm font-medium text-gray-500">
            <th className="w-1/2 pb-2">Product</th>
            <th className="w-1/4 pb-2">Last Order Date</th>
            <th className="w-1/4 pb-2">Purchase Order</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="py-8 text-center text-gray-500">
              You have no previous orders.
              <br />
              When you place an order, it will appear here.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : (
    <p className="font-semibold text-black">Log in to view order history</p>
  );
}
```

## File: src/app/order-history/page.tsx
```typescript
import { Metadata } from "next";
import { Suspense } from "react";
import { OrderHistoryDynamic } from "./dynamic";

export const metadata: Metadata = {
  title: "Order History",
};

export default async function Page() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="w-full border-b-2 border-accent1 text-left text-2xl text-accent1">
        Order History
      </h1>
      <div className="mx-auto flex max-w-md flex-col gap-4 text-black">
        <Suspense>
          <OrderHistoryDynamic />
        </Suspense>
      </div>
    </main>
  );
}
```

## File: src/app/scan/page.tsx
```typescript
"use client";

import { scan } from "react-scan"; // import this BEFORE react
import React from "react";
import Link from "next/link";

if (typeof window !== "undefined") {
  scan({
    enabled: true,
  });
}

export default function ScanPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="mb-4 text-lg">
        React Scan has loaded, you can now start exploring the site
      </p>
      <Link href="/" className="text-blue-500 underline hover:text-blue-700">
        Back to home
      </Link>
    </div>
  );
}
```

## File: src/app/auth.client.tsx
```typescript
"use client";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionState } from "@/lib/middleware";
import { signIn, signUp } from "./(login)/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [signInState, signInFormAction, signInPending] = useActionState<
    ActionState,
    FormData
  >(signIn, { error: "" });
  const [signUpState, signUpFormAction, signUpPending] = useActionState<
    ActionState,
    FormData
  >(signUp, { error: "" });
  const pending = signInPending || signUpPending;
  const state = signInState.error ? signInState : signUpState;

  return (
    <form className="flex flex-col space-y-6">
      <div className="flex flex-col gap-4">
        <div className="mt-1">
          <Input
            id="username"
            name="username"
            aria-label="Username"
            type="text"
            autoCapitalize="off"
            autoComplete="username"
            spellCheck={false}
            required
            maxLength={50}
            className="relative block w-full appearance-none rounded-[1px] border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
            placeholder="Username"
          />
        </div>

        <div>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              aria-label="Password"
              type="password"
              required
              maxLength={100}
              className="relative block w-full appearance-none rounded-[1px] border px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="rounded-[1px] bg-accent1 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent1 focus:outline-none focus:ring-2 focus:ring-accent1 focus:ring-offset-2"
          disabled={pending}
          formAction={signInFormAction}
        >
          {"Log in"}
        </Button>

        <Button
          type="submit"
          variant={"ghost"}
          className="rounded-[2px] border-[1px] border-accent1 bg-white px-4 py-2 text-xs font-semibold text-accent1"
          disabled={pending}
          formAction={signUpFormAction}
        >
          {"Create login"}
        </Button>
      </div>
      {state?.error && (
        <div className="text-sm text-red-500">{state.error}</div>
      )}
    </form>
  );
}

export function SignInSignUp() {
  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center gap-1">
        Log in{" "}
        <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
          <polygon points="0,0 5,6 10,0"></polygon>
        </svg>
      </PopoverTrigger>
      <PopoverContent className="px-8 py-4">
        <span className="text-sm font-semibold text-accent1">Log in</span>
        <LoginForm />
      </PopoverContent>
    </Popover>
  );
}

import { signOut } from "./(login)/actions";

export function SignOut(props: { username: string }) {
  return (
    <Popover>
      <PopoverTrigger className="flex flex-row items-center gap-1">
        {props.username}{" "}
        <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
          <polygon points="0,0 5,6 10,0"></polygon>
        </svg>
      </PopoverTrigger>
      <PopoverContent className="flex w-32 flex-col items-center px-8 py-4">
        <form>
          <Button
            formAction={signOut}
            variant={"ghost"}
            className="rounded-[2px] border-[1px] border-accent1 bg-white px-4 py-2 text-xs font-semibold text-accent1"
          >
            {"Sign Out"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
```

## File: src/app/auth.server.tsx
```typescript
import { getUser } from "@/lib/queries";
import { LoginForm, SignInSignUp, SignOut } from "./auth.client";

export async function AuthServer() {
  const user = await getUser();
  // TODO: Could dynamic load the sign-in/sign-up and sign-out components as they're not used on initial render
  if (!user) {
    return <SignInSignUp />;
  }
  return <SignOut username={user.username} />;
}

export async function PlaceOrderAuth() {
  const user = await getUser();
  if (user) {
    return null;
  }
  return (
    <>
      <p className="font-semibold text-accent1">Log in to place an order</p>
      <LoginForm />
    </>
  );
}
```

## File: src/app/data.ts
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const artSuppliesForArm = [
  {
    name: "Drawing and Sketching",
    categories: [
      "Graphite Pencils",
      "Charcoal Pencils & Sticks",
      "Colored Pencils",
      "Mechanical Pencils",
      "Pastels (Soft, Oil, and Hard)",
      "Erasers (Kneaded, Vinyl, Precision Tip)",
      "Pencil Sharpeners (Manual, Electric)",
      "Sketchpads (Various sizes and paper weights)",
      "Blending Stumps/Tortillons",
      "Rulers and Protractors",
    ],
  },
  {
    name: "Painting Supplies",
    categories: [
      "Acrylic Paints (Basic and Professional Grades)",
      "Watercolor Paints (Pans, Tubes)",
      "Oil Paints",
      "Gouache Paints",
      "Fabric Paints",
      "Brushes (Round, Flat, Filbert, Fan, etc.)",
      "Canvas (Stretched, Canvas Boards, Canvas Rolls)",
      "Painting Palettes (Wood, Plastic, Disposable)",
      "Palette Knives",
      "Easels (Tabletop, Standing)",
      "Watercolor Paper (Cold Press, Hot Press)",
    ],
  },
  {
    name: "Ink and Calligraphy",
    categories: [
      "Ink Pens (Dip Pens, Brush Pens, Fountain Pens)",
      "India Ink, Colored Inks",
      "Calligraphy Nibs and Holders",
      "Brush Calligraphy Sets",
      "Ink Blotting Papers",
      "Markers (Alcohol-based, Water-based, Permanent)",
      "Brush Pens (Fine Tip, Broad Tip)",
      "Bullet Journals and Specialty Notebooks",
    ],
  },
  {
    name: "Craft Supplies",
    categories: [
      "Crafting Glue (Hot Glue, PVA, Mod Podge)",
      "Craft Scissors",
      "Decorative Papers (Origami Paper, Scrapbooking Paper)",
      "Craft Foam Sheets",
      "Beads, Buttons, Sequins",
      "Feathers, Felt, and Fabric Scraps",
      "Cutting Mats",
      "X-Acto Knives",
      "Stencils (Alphabet, Geometric Shapes)",
    ],
  },
  {
    name: "Printmaking and Stamping",
    categories: [
      "Linoleum Blocks",
      "Carving Tools",
      "Brayers",
      "Ink for Block Printing",
      "Rubber Stamps",
      "Ink Pads (Various Colors)",
      "Screen Printing Kits",
    ],
  },
  {
    name: "Sculpting and Model Making",
    categories: [
      "Polymer Clay (FIMO, Sculpey)",
      "Air-Dry Clay",
      "Pottery Clay",
      "Sculpting Tools",
      "Wire Armature",
      "Modeling Foam",
      "Molds and Casting Materials",
      "Plaster of Paris",
    ],
  },
  {
    name: "Miscellaneous Tools and Accessories",
    categories: [
      "Art Aprons and Smocks",
      "Storage Boxes for Supplies",
      "Brush Cleaner Solutions",
      "Pencil Cases",
      "Portfolios and Presentation Cases",
      "Spray Fixatives",
      "Masking Tape and Artist’s Tape",
      "Measuring Tape",
      "Lightboxes for Tracing",
    ],
  },
];

export const artSupplies = [
  {
    collectionName: "Painting Supplies",
    categories: [
      {
        categoryName: "Acrylic Paints (Basic and Professional Grades)",
        icon: "/images/acrylic-paint-icon.png",
        categoryItems: [
          {
            subCollectionName: "Basic Acrylic Paints",
            subcategories: [
              {
                subcategoryName: "Student Grade",
                products: [
                  {
                    name: "Basics Acrylic Paint Set",
                    description:
                      "A set of 10 vibrant acrylic paints perfect for beginners and students.",
                    price: 19.99,
                    highlights: [
                      "Includes 10 colors: Red, Yellow, Blue, Green, Black, White, and more.",
                      "Non-toxic and water-based for easy clean-up.",
                      "Ideal for canvas, paper, and wood projects.",
                    ],
                  },
                  {
                    name: "Liquitex Basics Acrylic Paint",
                    description:
                      "High-quality, student-grade acrylic paint with smooth consistency.",
                    price: 8.99,
                    highlights: [
                      "Available in 118ml tubes, ideal for both students and hobbyists.",
                      "Highly pigmented for vibrant colors.",
                      "Fast-drying and flexible once dry.",
                    ],
                  },
                  {
                    name: "Daler-Rowney System 3 Acrylic Paint",
                    description:
                      "Affordable, versatile acrylic paint suitable for various surfaces.",
                    price: 7.5,
                    highlights: [
                      "Available in a wide range of colors.",
                      "Water-soluble and easy to blend.",
                      "Perfect for indoor and outdoor projects.",
                    ],
                  },
                  {
                    name: "Golden Heavy Body Acrylic Paint",
                    description:
                      "Professional-grade acrylic paint known for its thick, buttery texture.",
                    price: 12.5,
                    highlights: [
                      "Excellent pigment load for vibrant and intense colors.",
                      "Retains brush strokes and marks, perfect for textured painting.",
                      "Highly durable and flexible when dry.",
                    ],
                  },
                  {
                    name: "Winsor & Newton Galeria Acrylic Paint",
                    description:
                      "A high-quality acrylic paint range designed for students and beginners.",
                    price: 10.99,
                    highlights: [
                      "Smooth consistency for easy application.",
                      "Fast-drying and ideal for layering techniques.",
                      "Compatible with a variety of mediums and surfaces.",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
```

## File: src/app/error.tsx
```typescript
"use client";

export default function Page() {
  return <div>Error</div>;
}
```

## File: src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

input[type="color"],
input[type="date"],
input[type="datetime"],
input[type="datetime-local"],
input[type="email"],
input[type="month"],
input[type="number"],
input[type="password"],
input[type="search"],
input[type="tel"],
input[type="text"],
input[type="time"],
input[type="url"],
input[type="week"],
select:focus,
textarea {
  font-size: 16px;
}

[aria-label="Close toast"] {
  background-color: white;
}
```

## File: src/app/layout.tsx
```typescript
import type { Metadata } from "next";
import "./globals.css";
import { SearchDropdownComponent } from "@/components/search-dropdown";
import { MenuIcon } from "lucide-react";
import { Suspense } from "react";
import { Cart } from "@/components/cart";
import { AuthServer } from "./auth.server";
import { Link } from "@/components/ui/link";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { WelcomeToast } from "./welcome-toast";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    template: "%s | NextFaster",
    default: "NextFaster",
  },
  description: "A performant site built with Next.js",
};

export const revalidate = 86400; // One day

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex flex-col overflow-y-auto overflow-x-hidden antialiased`}
      >
        <div>
          <header className="fixed top-0 z-10 flex h-[90px] w-[100vw] flex-grow items-center justify-between border-b-2 border-accent2 bg-background p-2 pb-[4px] pt-2 sm:h-[70px] sm:flex-row sm:gap-4 sm:p-4 sm:pb-[4px] sm:pt-0">
            <div className="flex flex-grow flex-col">
              <div className="absolute right-2 top-2 flex justify-end pt-2 font-sans text-sm hover:underline sm:relative sm:right-0 sm:top-0">
                <Suspense
                  fallback={
                    <button className="flex flex-row items-center gap-1">
                      <div className="h-[20px]" />
                      <svg viewBox="0 0 10 6" className="h-[6px] w-[10px]">
                        <polygon points="0,0 5,6 10,0"></polygon>
                      </svg>
                    </button>
                  }
                >
                  <AuthServer />
                </Suspense>
              </div>
              <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                <Link
                  prefetch={true}
                  href="/"
                  className="text-4xl font-bold text-accent1"
                >
                  NextFaster
                </Link>
                <div className="items flex w-full flex-row items-center justify-between gap-4">
                  <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                    <SearchDropdownComponent />
                  </div>
                  <div className="flex flex-row justify-between space-x-4">
                    <div className="relative">
                      <Link
                        prefetch={true}
                        href="/order"
                        className="text-lg text-accent1 hover:underline"
                      >
                        ORDER
                      </Link>
                      <Suspense>
                        <Cart />
                      </Suspense>
                    </div>
                    <Link
                      prefetch={true}
                      href="/order-history"
                      className="hidden text-lg text-accent1 hover:underline md:block"
                    >
                      ORDER HISTORY
                    </Link>
                    <Link
                      prefetch={true}
                      href="/order-history"
                      aria-label="Order History"
                      className="block text-lg text-accent1 hover:underline md:hidden"
                    >
                      <MenuIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="pt-[85px] sm:pt-[70px]">{children}</div>
        </div>
        <footer className="fixed bottom-0 flex h-12 w-screen flex-col items-center justify-between space-y-2 border-t border-gray-400 bg-background px-4 font-sans text-[11px] sm:h-6 sm:flex-row sm:space-y-0">
          <div className="flex flex-wrap justify-center space-x-2 pt-2 sm:justify-start">
            <span className="hover:bg-accent2 hover:underline">Home</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">FAQ</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Returns</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Careers</span>
            <span>|</span>
            <span className="hover:bg-accent2 hover:underline">Contact</span>
          </div>
          <div className="text-center sm:text-right">
            By using this website, you agree to check out the{" "}
            <Link
              href="https://github.com/ethanniser/NextFaster"
              className="font-bold text-accent1 hover:underline"
              target="_blank"
            >
              Source Code
            </Link>
          </div>
        </footer>
        {/* does putting this in suspense do anything? */}
        <Suspense fallback={null}>
          <Toaster closeButton />
          <WelcomeToast />
        </Suspense>
        <Analytics scriptSrc="/insights/events.js" endpoint="/hfi/events" />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## File: src/app/not-found.tsx
```typescript
export default function Page() {
  return <div>404 - Not Found</div>;
}
```

## File: src/app/robots.txt
```
# Block all crawlers from accessing /products
User-agent: *
Disallow: /products

# Allow Twitter to fetch Open Graph data from /products
User-agent: Twitterbot
Allow: /products
Allow: /

# Allow Facebook to fetch Open Graph data from /products
User-agent: facebookexternalhit
Allow: /products
Allow: /

# Allow LinkedIn to fetch Open Graph data from /products
User-agent: LinkedInBot
Allow: /products
Allow: /

# Allow crawling of the homepage for all crawlers
User-agent: *
Allow: /
```

## File: src/app/welcome-toast.tsx
```typescript
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 850) return;
    if (!document.cookie.includes("welcome-toast=3")) {
      toast("🚀 Welcome to NextFaster!", {
        id: "welcome-toast",
        duration: Infinity,
        onDismiss: () => {
          document.cookie += "welcome-toast=3;max-age=31536000";
        },
        description: (
          <>
            This is a highly performant e-commerce template using Next.js. All
            of the 1M products on this site are AI generated.
            <hr className="my-2" />
            This demo is to highlight the speed a full-stack Next.js site can
            achieve.{" "}
            <a
              href="https://github.com/ethanniser/NextFaster"
              className="font-semibold text-accent1 hover:underline"
              target="_blank"
            >
              Get the Source
            </a>
            .
          </>
        ),
      });
    }
  }, []);

  return null;
}
```

## File: src/components/ui/button.tsx
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## File: src/components/ui/card.tsx
```typescript
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

## File: src/components/ui/input.tsx
```typescript
import * as React from "react";

import { cn } from "@/lib/utils";

// eslint-disable-next-line
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full border border-gray-500 bg-transparent px-3 py-1 text-sm outline-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

## File: src/components/ui/label.tsx
```typescript
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

## File: src/components/ui/link.tsx
```typescript
"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`, {
    priority: "low",
  });
  // only throw in dev
  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();

export const Link: typeof NextLink = (({ children, ...props }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  let prefetchTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (props.prefetch === false) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeout = setTimeout(async () => {
            router.prefetch(String(props.href));
            await sleep(0);

            if (!imageCache.has(String(props.href))) {
              void prefetchImages(String(props.href)).then((images) => {
                imageCache.set(String(props.href), images);
              }, console.error);
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }, [props.href, props.prefetch]);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={() => {
        router.prefetch(String(props.href));
        const images = imageCache.get(String(props.href)) || [];
        for (const image of images) {
          prefetchImage(image);
        }
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;
}
```

## File: src/components/ui/popover.tsx
```typescript
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none duration-75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
```

## File: src/components/ui/product-card.tsx
```typescript
"use client";
import { Link } from "@/components/ui/link";
import NextImage from "next/image";
import { getImageProps } from "next/image";
import { Product } from "@/db/schema";
import { useEffect } from "react";

export function getProductLinkImageProps(
  imageUrl: string,
  productName: string,
) {
  return getImageProps({
    width: 48,
    height: 48,
    quality: 65,
    src: imageUrl,
    alt: `A small picture of ${productName}`,
  });
}

export function ProductLink(props: {
  imageUrl?: string | null;
  category_slug: string;
  subcategory_slug: string;
  loading: "eager" | "lazy";
  product: Product;
}) {
  const { category_slug, subcategory_slug, product, imageUrl } = props;

  // prefetch the main image for the product page, if this is too heavy
  // we could only prefetch the first few cards, then prefetch on hover
  const prefetchProps = getImageProps({
    height: 256,
    quality: 80,
    width: 256,
    src: imageUrl ?? "/placeholder.svg?height=64&width=64",
    alt: `A small picture of ${product.name}`,
  });
  useEffect(() => {
    try {
      const iprops = prefetchProps.props;
      const img = new Image();
      // Don't interfer with important requests
      img.fetchPriority = "low";
      // Don't block the main thread with prefetch images
      img.decoding = "async";
      // Order is important here, sizes must be set before srcset, srcset must be set before src
      if (iprops.sizes) img.sizes = iprops.sizes;
      if (iprops.srcSet) img.srcset = iprops.srcSet;
      if (iprops.src) img.src = iprops.src;
    } catch (e) {
      console.error("failed to preload", prefetchProps.props.src, e);
    }
  }, [prefetchProps]);
  return (
    <Link
      prefetch={true}
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      href={`/products/${category_slug}/${subcategory_slug}/${product.slug}`}
    >
      <div className="py-2">
        <NextImage
          loading={props.loading}
          decoding="sync"
          src={imageUrl ?? "/placeholder.svg?height=48&width=48"}
          alt={`A small picture of ${product.name}`}
          width={48}
          height={48}
          quality={65}
          className="h-auto w-12 flex-shrink-0 object-cover"
        />
      </div>
      <div className="px-2" />
      <div className="h-26 flex flex-grow flex-col items-start py-2">
        <div className="text-sm font-medium text-gray-700 group-hover:underline">
          {product.name}
        </div>
        <p className="overflow-hidden text-xs">{product.description}</p>
      </div>
    </Link>
  );
}
```

## File: src/components/ui/scroll-area.tsx
```typescript
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
```

## File: src/components/add-to-cart-form.tsx
```typescript
"use client";
import { useActionState } from "react";
import { addToCart } from "@/lib/actions";

export function AddToCartForm({ productSlug }: { productSlug: string }) {
  const [message, formAction, isPending] = useActionState(addToCart, null);
  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <input type="hidden" name="productSlug" value={productSlug} />
      <button
        type="submit"
        className="max-w-[150px] rounded-[2px] bg-accent1 px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {isPending && <p>Adding to cart...</p>}
      {!isPending && message && <p>{message}</p>}
    </form>
  );
}
```

## File: src/components/cart.tsx
```typescript
import { getCart } from "@/lib/cart";

export async function Cart() {
  const cart = await getCart();
  if (cart.length == 0) {
    return null;
  }
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <div className="absolute -right-3 -top-1 rounded-full bg-accent2 px-1 text-xs text-accent1">
      {totalQuantity}
    </div>
  );
}
```

## File: src/components/login-form.tsx
```typescript
export function LoginForm() {
  return (
    <div className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        className="w-full border border-black p-2 pr-16 outline-none"
        disabled
      />
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-black p-2 pr-16 outline-none"
          disabled
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600">
          show
        </div>
      </div>
      <div className="flex justify-between space-x-2">
        <div className="flex flex-row items-center justify-center space-x-2">
          <input
            type="checkbox"
            id="stay-logged-in"
            className="border"
            disabled
          />
          <label htmlFor="stay-logged-in" className="text-sm">
            Stay logged in
          </label>
        </div>
        <div className="text-sm underline">Reset Password</div>
      </div>
      <div className="w-full rounded-sm bg-accent1 p-2 text-center font-bold text-white hover:bg-accent1">
        Log in
      </div>
      <div className="w-full rounded-sm border border-accent1 p-2 text-center font-bold text-accent1">
        Create login
      </div>
    </div>
  );
}
```

## File: src/components/search-dropdown.tsx
```typescript
"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product } from "../db/schema";
import { Link } from "@/components/ui/link";
import { useParams, useRouter } from "next/navigation";
import { ProductSearchResult } from "@/app/api/search/route";

type SearchResult = Product & { href: string };

export function SearchDropdownComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // we don't need react query, we have react query at home
  // react query at home:
  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredItems([]);
    } else {
      setIsLoading(true);

      const searchedFor = searchTerm;
      fetch(`/api/search?q=${searchTerm}`).then(async (results) => {
        const currentSearchTerm = inputRef.current?.value;
        if (currentSearchTerm !== searchedFor) {
          return;
        }
        const json = await results.json();
        setIsLoading(false);
        setFilteredItems(json as ProductSearchResult);
      });
    }
  }, [searchTerm, inputRef]);

  const params = useParams();
  useEffect(() => {
    if (!params.product) {
      const subcategory = params.subcategory;
      setSearchTerm(
        typeof subcategory === "string" ? subcategory.replaceAll("-", " ") : "",
      );
    }
  }, [params]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredItems.length - 1 ? prevIndex + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredItems.length - 1,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      router.push(filteredItems[highlightedIndex].href);
      setSearchTerm(filteredItems[highlightedIndex].name);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // close dropdown when clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="font-sans" ref={dropdownRef}>
      <div className="relative flex-grow">
        <div className="relative">
          <Input
            ref={inputRef}
            autoCapitalize="off"
            autoCorrect="off"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(e.target.value.length > 0);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="pr-12 font-sans font-medium sm:w-[300px] md:w-[375px]"
          />
          <X
            className={cn(
              "absolute right-7 top-2 h-5 w-5 text-muted-foreground",
              {
                hidden: !isOpen,
              },
            )}
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
          />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full border border-gray-200 bg-white shadow-lg">
            <ScrollArea className="h-[300px]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <Link href={item.href} key={item.slug} prefetch={true}>
                    <div
                      className={cn("flex cursor-pointer items-center p-2", {
                        "bg-gray-100": index === highlightedIndex,
                      })}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => {
                        setSearchTerm(item.name);
                        setIsOpen(false);
                        inputRef.current?.blur();
                      }}
                    >
                      <Image
                        loading="eager"
                        decoding="sync"
                        src={item.image_url ?? "/placeholder.svg"}
                        alt=""
                        className="h-10 w-10 pr-2"
                        height={40}
                        width={40}
                        quality={65}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </Link>
                ))
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-gray-500">No results found</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: src/db/index.ts
```typescript
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
```

## File: src/db/schema.ts
```typescript
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export type Collection = typeof collections.$inferSelect;

export const categories = pgTable(
  "categories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    collection_id: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    collectionIdIdx: index("categories_collection_id_idx").on(
      table.collection_id,
    ),
  }),
);

export type Category = typeof categories.$inferSelect;

export const subcollections = pgTable(
  "subcollections",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category_slug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onDelete: "cascade" }),
  },
  (table) => ({
    categorySlugIdx: index("subcollections_category_slug_idx").on(
      table.category_slug,
    ),
  }),
);

export type Subcollection = typeof subcollections.$inferSelect;

export const subcategories = pgTable(
  "subcategories",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    subcollection_id: integer("subcollection_id")
      .notNull()
      .references(() => subcollections.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    subcollectionIdIdx: index("subcategories_subcollection_id_idx").on(
      table.subcollection_id,
    ),
  }),
);

export type Subcategory = typeof subcategories.$inferSelect;

export const products = pgTable(
  "products",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: numeric("price").notNull(),
    subcategory_slug: text("subcategory_slug")
      .notNull()
      .references(() => subcategories.slug, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    nameSearchIndex: index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
    nameTrgmIndex: index("name_trgm_index")
      .using("gin", sql`${table.name} gin_trgm_ops`)
      .concurrently(),
    subcategorySlugIdx: index("products_subcategory_slug_idx").on(
      table.subcategory_slug,
    ),
  }),
);

export type Product = typeof products.$inferSelect;

export const collectionsRelations = relations(collections, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [categories.collection_id],
    references: [collections.id],
  }),
  subcollections: many(subcollections),
}));

export const subcollectionRelations = relations(
  subcollections,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcollections.category_slug],
      references: [categories.slug],
    }),
    subcategories: many(subcategories),
  }),
);

export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    subcollection: one(subcollections, {
      fields: [subcategories.subcollection_id],
      references: [subcollections.id],
    }),
    products: many(products),
  }),
);

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategory_slug],
    references: [subcategories.slug],
  }),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## File: src/lib/actions.ts
```typescript
"use server";

import { getCart, updateCart } from "./cart";

export async function addToCart(prevState: unknown, formData: FormData) {
  const prevCart = await getCart();
  const productSlug = formData.get("productSlug");
  if (typeof productSlug !== "string") {
    return;
  }
  const itemAlreadyExists = prevCart.find(
    (item) => item.productSlug === productSlug,
  );
  if (itemAlreadyExists) {
    const newQuantity = itemAlreadyExists.quantity + 1;
    const newCart = prevCart.map((item) => {
      if (item.productSlug === productSlug) {
        return {
          ...item,
          quantity: newQuantity,
        };
      }
      return item;
    });
    await updateCart(newCart);
  } else {
    const newCart = [
      ...prevCart,
      {
        productSlug,
        quantity: 1,
      },
    ];
    await updateCart(newCart);
  }

  return "Item added to cart";
}

export async function removeFromCart(formData: FormData) {
  const prevCart = await getCart();
  const productSlug = formData.get("productSlug");
  if (typeof productSlug !== "string") {
    return;
  }
  const itemAlreadyExists = prevCart.find(
    (item) => item.productSlug === productSlug,
  );
  if (!itemAlreadyExists) {
    return;
  }
  const newCart = prevCart.filter((item) => item.productSlug !== productSlug);
  await updateCart(newCart);
}
```

## File: src/lib/cart.ts
```typescript
import { db } from "@/db";
import { cookies } from "next/headers";
import { z } from "zod";

const cartSchema = z.array(
  z.object({
    productSlug: z.string(),
    quantity: z.number(),
  }),
);

export type CartItem = z.infer<typeof cartSchema>[number];

export async function updateCart(newItems: CartItem[]) {
  (await cookies()).set("cart", JSON.stringify(newItems), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getCart() {
  const cart = (await cookies()).get("cart");
  if (!cart) {
    return [];
  }
  try {
    return cartSchema.parse(JSON.parse(cart.value));
  } catch {
    console.error("Failed to parse cart cookie");
    return [];
  }
}

export async function detailedCart() {
  const cart = await getCart();

  const products = await db.query.products.findMany({
    where: (products, { inArray }) =>
      inArray(
        products.slug,
        cart.map((item) => item.productSlug),
      ),
    with: {
      subcategory: {
        with: {
          subcollection: true,
        },
      },
    },
  });

  const withQuantity = products.map((product) => ({
    ...product,
    quantity:
      cart.find((item) => item.productSlug === product.slug)?.quantity ?? 0,
  }));
  return withQuantity;
}
```

## File: src/lib/middleware.ts
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}
```

## File: src/lib/queries.ts
```typescript
import { cookies } from "next/headers";
import { verifyToken } from "./session";
import {
  categories,
  products,
  subcategories,
  subcollections,
  users,
} from "@/db/schema";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { unstable_cache } from "./unstable-cache";
import { sql } from "drizzle-orm";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export const getProductsForSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    db.query.products.findMany({
      where: (products, { eq, and }) =>
        and(eq(products.subcategory_slug, subcategorySlug)),
      orderBy: (products, { asc }) => asc(products.slug),
    }),
  ["subcategory-products"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollections = unstable_cache(
  () =>
    db.query.collections.findMany({
      with: {
        categories: true,
      },
      orderBy: (collections, { asc }) => asc(collections.name),
    }),
  ["collections"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductDetails = unstable_cache(
  (productSlug: string) =>
    db.query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, productSlug),
    }),
  ["product"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    db.query.subcategories.findFirst({
      where: (subcategories, { eq }) => eq(subcategories.slug, subcategorySlug),
    }),
  ["subcategory"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCategory = unstable_cache(
  (categorySlug: string) =>
    db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.slug, categorySlug),
      with: {
        subcollections: {
          with: {
            subcategories: true,
          },
        },
      },
    }),
  ["category"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollectionDetails = unstable_cache(
  async (collectionSlug: string) =>
    db.query.collections.findMany({
      with: {
        categories: true,
      },
      where: (collections, { eq }) => eq(collections.slug, collectionSlug),
      orderBy: (collections, { asc }) => asc(collections.slug),
    }),
  ["collection"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductCount = unstable_cache(
  () => db.select({ count: count() }).from(products),
  ["total-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

// could be optimized by storing category slug on the products table
export const getCategoryProductCount = unstable_cache(
  (categorySlug: string) =>
    db
      .select({ count: count() })
      .from(categories)
      .leftJoin(
        subcollections,
        eq(categories.slug, subcollections.category_slug),
      )
      .leftJoin(
        subcategories,
        eq(subcollections.id, subcategories.subcollection_id),
      )
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .where(eq(categories.slug, categorySlug)),
  ["category-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategoryProductCount = unstable_cache(
  (subcategorySlug: string) =>
    db
      .select({ count: count() })
      .from(products)
      .where(eq(products.subcategory_slug, subcategorySlug)),
  ["subcategory-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSearchResults = unstable_cache(
  async (searchTerm: string) => {
    let results;

    // do we really need to do this hybrid search pattern?

    if (searchTerm.length <= 2) {
      // If the search term is short (e.g., "W"), use ILIKE for prefix matching
      results = await db
        .select()
        .from(products)
        .where(sql`${products.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    } else {
      // For longer search terms, use full-text search with tsquery
      const formattedSearchTerm = searchTerm
        .split(" ")
        .filter((term) => term.trim() !== "") // Filter out empty terms
        .map((term) => `${term}:*`)
        .join(" & ");

      results = await db
        .select()
        .from(products)
        .where(
          sql`to_tsvector('english', ${products.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    }

    return results;
  },
  ["search-results"],
  { revalidate: 60 * 60 * 2 }, // two hours
);
```

## File: src/lib/rate-limit.ts
```typescript
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error(
    "Please link a Vercel KV instance or populate `KV_REST_API_URL` and `KV_REST_API_TOKEN`",
  );
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

export const signUpRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "15 m"),
  analytics: true,
  prefix: "ratelimit:signup",
});
```

## File: src/lib/session.ts
```typescript
import { NewUser } from "@/db/schema";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string,
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set("session", encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}
```

## File: src/lib/unstable-cache.ts
```typescript
import { unstable_cache as next_unstable_cache } from "next/cache";
import { cache } from "react";

// next_unstable_cache doesn't handle deduplication, so we wrap it in React's cache
export const unstable_cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number },
) => cache(next_unstable_cache(callback, key, options));
```

## File: src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## File: .eslintrc.json
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

## File: .gitattributes
```
data/data.zip filter=lfs diff=lfs merge=lfs -text
```

## File: .gitignore
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

## File: .prettierignore
```
node_modules
.next
.vercel
pnpm-lock.yaml
```

## File: components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## File: drizzle.config.ts
```typescript
import "./drizzle/envConfig";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  verbose: true,
  strict: true,
});
```

## File: LICENSE
```
MIT License

Copyright (c) 2024 Ethan Niser

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## File: next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    inlineCss: true,
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bevgyjm5apuichhj.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/insights/vitals.js",
        destination:
          "https://cdn.vercel-insights.com/v1/speed-insights/script.js",
      },
      {
        source: "/insights/events.js",
        destination: "https://cdn.vercel-insights.com/v1/script.js",
      },
      {
        source: "/hfi/events/:slug*",
        destination:
          "https://vitals.vercel-insights.com/v1/:slug*?dsn=KD0ni5HQVdxsHAF2tqBECObqH",
      },
      {
        source: "/hfi/vitals",
        destination:
          "https://vitals.vercel-insights.com/v2/vitals?dsn=fsGnK5U2NRPzYx0Gch0g5w5PxT1",
      },
    ];
  },
};

export default nextConfig;
```

## File: package.json
```json
{
  "name": "next-faster",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc",
    "format:check": "prettier --check .",
    "format": "prettier --write . --list-different",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@ai-sdk/openai": "^0.0.68",
    "@effect/platform": "^0.68.6",
    "@effect/platform-node": "^0.63.6",
    "@neondatabase/serverless": "^1.0.2",
    "@next/env": "^14.2.15",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@types/bcryptjs": "^2.4.6",
    "@upstash/ratelimit": "^2.0.3",
    "@upstash/redis": "^1.35.6",
    "@vercel/analytics": "^1.3.1",
    "@vercel/blob": "^0.25.1",
    "@vercel/functions": "^1.4.2",
    "@vercel/kv": "^3.0.0",
    "@vercel/speed-insights": "^1.0.12",
    "ai": "^3.4.16",
    "babel-plugin-react-compiler": "19.0.0-beta-df7b47d-20241124",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "drizzle-orm": "^0.44.7",
    "effect": "^3.9.2",
    "geist": "^1.3.1",
    "jose": "^5.9.4",
    "linkedom": "^0.18.5",
    "lucide-react": "^0.453.0",
    "next": "15.6.0-canary.60",
    "openai": "^4.68.0",
    "react": "19.0.0-rc-cd22717c-20241013",
    "react-dom": "19.0.0-rc-cd22717c-20241013",
    "react-scan": "^0.0.35",
    "slugify": "^1.6.6",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.16.12",
    "@types/react": "npm:types-react@19.0.0-rc.1",
    "@types/react-dom": "npm:types-react-dom@19.0.0-rc.1",
    "drizzle-kit": "^0.26.2",
    "eslint": "^8.57.1",
    "eslint-config-next": "15.0.0-rc.1",
    "postcss": "^8.4.47",
    "postcss-hover-media-feature": "^1.0.2",
    "prettier-plugin-tailwindcss": "^0.6.8",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  },
  "pnpm": {
    "overrides": {
      "@types/react": "npm:types-react@19.0.0-rc.1",
      "@types/react-dom": "npm:types-react-dom@19.0.0-rc.1",
      "react": "19.0.0-rc-cd22717c-20241013",
      "react-dom": "19.0.0-rc-cd22717c-20241013"
    }
  },
  "packageManager": "pnpm@9.12.0+sha512.4abf725084d7bcbafbd728bfc7bee61f2f791f977fd87542b3579dcb23504d170d46337945e4c66485cd12d588a0c0e570ed9c477e7ccdd8507cf05f3f92eaca"
}
```

## File: postcss.config.mjs
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    "postcss-hover-media-feature": {},
  },
};

export default config;
```

## File: prettier.config.cjs
```javascript
/** @typedef  {import("prettier").Config} PrettierConfig */

/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
};

module.exports = config;
```

## File: README.md
```markdown
## NextFaster

A highly performant e-commerce template using Next.js and AI generated content by [@ethanniser](https://x.com/ethanniser), [@RhysSullivan](https://x.com/RhysSullivan) and [@armans-code](https://x.com/ksw_arman)

### Design notes

**Check out the detailed [twitter thread](https://x.com/ethanniser/status/1848442738204643330)**

- Uses [Next.js 15](https://nextjs.org/)
  - All mutations are done via [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Partial Prerendering](https://vercel.com/blog/partial-prerendering-with-next-js-creating-a-new-default-rendering-model) is used to precompute the shells of pages
  - When deployed, these are served statically from the edge
  - Dynamic data (such as cart information) is then streamed in
- Uses [Drizzle ORM](https://orm.drizzle.team/docs/overview) on top of [Neon Postgres](https://neon.tech)
- Images stored on [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- Used [v0](https://v0.dev) to generate all initial UIs, check out some of the threads we were particularly impressed by:
  - [v0 makes pretty impressive search dropdown without a library](https://v0.dev/chat/lFfc68X3fir?b=b_1o4tkiC9EEm&p=0)
  - [recreating 'order' page](https://v0.dev/chat/RTBa8dXhx03?b=b_4RguNNUEhLh)
  - [recreating 'login' page](https://v0.dev/chat/tijwMFByNX9?b=b_XnRtduKn2oe)

#### AI

- Used [OpenAI](https://openai.com)'s `gpt-4o-mini` with their batch API and the Vercel AI SDK to generate product categories, names and descriptions
- [GetImg.ai](https://getimg.ai) was used to generate product images via the `stable-diffusion-v1-5` model

### Deployment

- Make sure the Vercel project is connected to a Vercel Postgres (Neon) database and Vercel Blob Storage
- Run `pnpm db:push` to apply schema to your db

### Local dev

- Run `vc link` to link your project to Vercel.
- Run `vc env pull` to get a `.env.local` file with your db credentials.
- Run `pnpm install` && `pnpm dev` to start developing.
- The data/data.zip includes a ~300 MB data.sql file with the full schema and 1,000,000+ products (_Note, the data exceeds the size limit allowed by the free tier for Neon on Vercel_ [see more](https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing#pricing)). To seed Vercel Postgres with this data:
  - Unzip data.zip to data.sql.
  - Run `psql "YOUR_CONNECTION_STRING" -f data/data.sql`.
- Create the default roles in your database.
  -Run `psql "YOUR_CONNECTION_STRING"`
  -Now run CREATE ROLE default; and CREATE ROLE cloud_admin;
- For DB migrations with `drizzle-kit`:
  - Make sure `?sslmode=required` is added to the `POSTGRES_URL` env for dev
  - Run `pnpm db:push` to apply schema to your db

### Performance

[PageSpeed Report](https://pagespeed.web.dev/analysis/https-next-faster-vercel-app/7iywdkce2k?form_factor=desktop)

<img width="822" alt="SCR-20241027-dmsb" src="https://github.com/user-attachments/assets/810bc4c7-2e01-422d-9c3d-45daf5fb13ce">

### Costs

This project is hosted on Vercel, and uses many of the features of the Vercel platform.

Here is the full breakdown of the cost of running this project from Oct 20th 2024 through Nov 11th 2024.

During that time, the project recieved **over 1 million page views** across 45k unique users. The site has **over 1 million unique pages and images\***.

\*_images are unique by url (and caching) although not unqiue in their content_

#### Summary:

- ~1 million page views
- ~1 million unqiue product pages
- 45k unique users
- $513.12

Is $500 a lot for hosting this site? It depends, in this instance if it was a real ecommerce site that hosting cost would've been made back in the first 10k visitors.

It is likely possible to optimize these costs further if that is your goal, however that wasn't a priority for this project. We wanted to try and build the fastest possible site, quickly. We definitely achieved that goal without ever having to think about infra once.

These numbers are also on top of the Vercel pro plan, which is $20/contributor/month.

We would like to thank Vercel for covering the costs of hosting this project.

#### Compute and Caching

These costs represent the core functionality of serving the site.

| Resource             | Included                    | On-demand     | Charge  | Notes                                                                                 |
| -------------------- | --------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------- |
| Function Invocations | 1M / 1M                     | +31M          | $18.00  |
| Function Duration    | 1,000 GB-Hrs / 1,000 GB-Hrs | +333.7 GB-Hrs | $33.48  | Using In-function Concurrency reduces our compute usage by over 50% (see image below) |
| Edge Requests        | 10M / 10M                   | +93M          | $220.92 |                                                                                       |
| Fast Origin Transfer | 100 GB / 100 GB             | +461.33 GB    | $26.33  |                                                                                       |
| ISR Writes           | 2M / 2M                     | +12M          | $46.48  |                                                                                       |
| ISR Reads            | 10M / 10M                   | +20M          | $7.91   |                                                                                       |

Total: $353.12

#### Images

These costs represent the image optimization done by Vercel.

| Resource           | Included    | On-demand | Charge  | Notes                                                                                                                                                                                                                                                                              |
| ------------------ | ----------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image Optimization | 5000 / 5000 | +101,784  | $160.00 | This represents the number of distinct source images used on the site and optimized by Vercel. Each of the 1 million products has a unique image. The reason this number is less than 1 million is because the optimization is done on demand and not all pages have been visited. |

Total: $160.00

#### Even More Info

![image](https://github.com/user-attachments/assets/fc0ba91c-6e58-4ea0-8c1c-3acfaf56e98a)

![image](https://github.com/user-attachments/assets/fa208c6f-a943-42f2-ae90-3c50889cc98e)

![image](https://github.com/user-attachments/assets/e04b0948-e18c-4bd5-b0d4-7ef65f2af84a)
```

## File: tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        accent1: "#1d4ed8",
        accent2: "#bfdbfe",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindAnimate],
};
export default config;
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "target": "ES2017"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

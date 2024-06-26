import { defineCollection, z } from 'astro:content';

const pageSchema = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
  }),
});

const articleSchema = defineCollection({
  schema: z.object({
    title: z.string(),
    short_description: z.string(),
    slug: z.string(),
    thumbnail: z.string(),
    sortRank: z.number(),
  }),
});

const newsSchema = defineCollection({
  schema: z.object({
    title: z.string(),
    short_description: z.string(),
    slug: z.string(),
    thumbnail: z.string(),
    date: z.string(),
  }),
});

const modelDescriptionSchema = defineCollection({
  schema: z.object({}),
});
const itemDescriptionSchema = defineCollection({
  schema: z.object({}),
});
const modelAdditionalInfoSchema = defineCollection({
  schema: z.object({ title: z.string().optional() }),
});

export const collection = {
  pages: pageSchema,
  news: newsSchema,
  articles: articleSchema,
  modelDescriptions: modelDescriptionSchema,
  modelAdditionalInfos: modelAdditionalInfoSchema,
  itemDescriptions: itemDescriptionSchema,
};

import { defineCollection, z } from 'astro:content'

const pageSchema = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().optional()
  })
})

const modelDescriptionSchema = defineCollection({
  schema: z.object({})
})
const itemDescriptionSchema = defineCollection({
  schema: z.object({})
})
const modelAdditionalInfoSchema = defineCollection({
  schema: z.object({ title: z.string().optional() })
})

export const collection = {
  pages: pageSchema,
  modelDescriptions: modelDescriptionSchema,
  modelAdditionalInfos: modelAdditionalInfoSchema,
  itemDescriptions: itemDescriptionSchema,
}
import type { CollectionConfig } from 'payload'

export const allPostsSlug = 'all-posts'

export const AllPostsCollection: CollectionConfig = {
  slug: allPostsSlug,
  fields: [
    {
      name: 'posts',
      type: 'join',
      collection: 'posts',
      on: 'list',
    },
  ],
}

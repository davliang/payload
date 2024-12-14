import type { CollectionConfig } from 'payload'

export const postsSlug = 'posts'

export const PostsCollection: CollectionConfig = {
  slug: postsSlug,
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'list',
      type: 'relationship',
      relationTo: 'all-posts',
    },
  ],
  versions: {
    drafts: true,
  },
}

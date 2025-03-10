import type { Data, Field, TabAsField, User } from 'payload'

import { getDefaultValue } from 'payload'
import { fieldAffectsData, tabHasName } from 'payload/shared'

import { iterateFields } from './iterateFields.js'

type Args<T> = {
  data: T
  field: Field | TabAsField
  id?: number | string
  locale: string | undefined
  siblingData: Data
  user: User
}

// TODO: Make this works for rich text subfields
export const defaultValuePromise = async <T>({
  id,
  data,
  field,
  locale,
  siblingData,
  user,
}: Args<T>): Promise<void> => {
  if (fieldAffectsData(field)) {
    if (
      typeof siblingData[field.name] === 'undefined' &&
      typeof field.defaultValue !== 'undefined'
    ) {
      siblingData[field.name] = await getDefaultValue({
        defaultValue: field.defaultValue,
        locale,
        user,
        value: siblingData[field.name],
      })
    }
  }

  // Traverse subfields
  switch (field.type) {
    case 'array': {
      const rows = siblingData[field.name]

      if (Array.isArray(rows)) {
        const promises = []

        rows.forEach((row) => {
          promises.push(
            iterateFields({
              id,
              data,
              fields: field.fields,
              locale,
              siblingData: row,
              user,
            }),
          )
        })

        await Promise.all(promises)
      }
      break
    }

    case 'blocks': {
      const rows = siblingData[field.name]

      if (Array.isArray(rows)) {
        const promises = []
        rows.forEach((row) => {
          const blockTypeToMatch = row.blockType
          const block = field.blocks.find((blockType) => blockType.slug === blockTypeToMatch)

          if (block) {
            row.blockType = blockTypeToMatch

            promises.push(
              iterateFields({
                id,
                data,
                fields: block.fields,
                locale,
                siblingData: row,
                user,
              }),
            )
          }
        })
        await Promise.all(promises)
      }

      break
    }

    case 'collapsible':

    case 'row': {
      await iterateFields({
        id,
        data,
        fields: field.fields,
        locale,
        siblingData,
        user,
      })

      break
    }
    case 'group': {
      if (typeof siblingData[field.name] !== 'object') {
        siblingData[field.name] = {}
      }

      const groupData = siblingData[field.name] as Record<string, unknown>

      await iterateFields({
        id,
        data,
        fields: field.fields,
        locale,
        siblingData: groupData,
        user,
      })

      break
    }

    case 'tab': {
      let tabSiblingData
      if (tabHasName(field)) {
        if (typeof siblingData[field.name] !== 'object') {
          siblingData[field.name] = {}
        }

        tabSiblingData = siblingData[field.name] as Record<string, unknown>
      } else {
        tabSiblingData = siblingData
      }

      await iterateFields({
        id,
        data,
        fields: field.fields,
        locale,
        siblingData: tabSiblingData,
        user,
      })

      break
    }

    case 'tabs': {
      await iterateFields({
        id,
        data,
        fields: field.tabs.map((tab) => ({ ...tab, type: 'tab' })),
        locale,
        siblingData,
        user,
      })

      break
    }

    default: {
      break
    }
  }
}

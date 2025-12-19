import { type SchemaTypeDefinition } from 'sanity'

import { categoryType } from './categoryType'
import { customerType } from './customerType'
import { heroImageType } from './heroImageType'
import { orderType } from './orderType'
import { productType } from './productType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, customerType, heroImageType, productType, orderType],
}

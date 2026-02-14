import { type SchemaTypeDefinition } from 'sanity'

import { brandType } from './brandType'
import { categoryType } from './categoryType'
import { customerType } from './customerType'
import { groomingBookingType } from './groomingBookingType'
import { heroImageType } from './heroImageType'
import { orderType } from './orderType'
import { productType } from './productType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [brandType, categoryType, customerType, groomingBookingType, heroImageType, productType, orderType],
}

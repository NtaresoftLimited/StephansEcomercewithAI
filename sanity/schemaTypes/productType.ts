import { PackageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { MATERIALS_SANITY_LIST, COLORS_SANITY_LIST } from "@/lib/constants/filters";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "media", title: "Media" },
    { name: "inventory", title: "Inventory" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "details",
      validation: (rule) => [rule.required().error("Product name is required")],
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for URL generation"),
      ],
    }),
    defineField({
      name: "description",
      type: "text",
      group: "details",
      rows: 4,
      description: "Product description",
    }),
    defineField({
      name: "price",
      type: "number",
      group: "details",
      description: "Price in TZS (Tanzania Shillings)",
      validation: (rule) => [
        rule.required().error("Price is required"),
        rule.positive().error("Price must be a positive number"),
      ],
    }),
    defineField({
      name: "odooId",
      type: "number",
      group: "details",
      description: "Internal Odoo ID for syncing",
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      group: "details",
      validation: (rule) => [rule.required().error("Category is required")],
    }),
    defineField({
      name: "brand",
      type: "reference",
      to: [{ type: "brand" }],
      group: "details",
    }),
    defineField({
      name: "material",
      type: "string",
      group: "details",
      options: {
        list: MATERIALS_SANITY_LIST,
        layout: "radio",
      },
    }),
    defineField({
      name: "color",
      type: "string",
      group: "details",
      options: {
        list: COLORS_SANITY_LIST,
        layout: "radio",
      },
    }),
    defineField({
      name: "dimensions",
      type: "string",
      group: "details",
      description: 'e.g., "120cm x 80cm x 75cm"',
    }),
    defineField({
      name: "images",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (rule) => [
        rule.min(1).error("At least one image is required"),
      ],
    }),
    defineField({
      name: "stock",
      type: "number",
      group: "inventory",
      initialValue: 0,
      description: "Number of items in stock",
      validation: (rule) => [
        rule.min(0).error("Stock cannot be negative"),
        rule.integer().error("Stock must be a whole number"),
      ],
    }),
    defineField({
      name: "variants",
      title: "Product Variants",
      type: "array",
      group: "inventory",
      description: "Size/weight variants with different prices (e.g., 400g, 3kg, 10kg, 20kg)",
      of: [
        {
          type: "object",
          name: "productVariant",
          title: "Variant",
          fields: [
            {
              name: "name",
              type: "string",
              title: "Variant Name",
              description: "e.g., '3kg', '10kg', 'Small', 'Large'",
              validation: (rule: any) => rule.required(),
            },
            {
              name: "sku",
              type: "string",
              title: "SKU",
              description: "Unique stock keeping unit",
            },
            {
              name: "price",
              type: "number",
              title: "Price (TZS)",
              description: "Price for this variant",
              validation: (rule: any) => rule.required().positive(),
            },
            {
              name: "compareAtPrice",
              type: "number",
              title: "Compare At Price (TZS)",
              description: "Original price for showing discounts",
            },
            {
              name: "stock",
              type: "number",
              title: "Stock",
              description: "Available quantity for this variant",
              initialValue: 0,
              validation: (rule: any) => rule.min(0),
            },
            {
              name: "weight",
              type: "string",
              title: "Weight",
              description: "e.g., '400g', '3kg'",
            },
            {
              name: "odooVariantId",
              type: "number",
              title: "Odoo Variant ID",
              description: "Internal Odoo product.product ID",
            },
          ],
          preview: {
            select: {
              title: "name",
              price: "price",
              weight: "weight",
            },
            prepare({ title, price, weight }: { title?: string; price?: number; weight?: string }) {
              return {
                title: title || weight || "Variant",
                subtitle: price ? `TZS ${price.toLocaleString()}` : "",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "inventory",
      initialValue: false,
      description: "Show on homepage and promotions",
    }),
    defineField({
      name: "assemblyRequired",
      type: "boolean",
      group: "inventory",
      initialValue: false,
      description: "Does this product require assembly?",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category.title",
      media: "images.0",
      price: "price",
    },
    prepare({ title, subtitle, media, price }) {
      return {
        title,
        subtitle: `${subtitle ? subtitle + " • " : ""}TZS ${price ?? 0}`,
        media,
      };
    },
  },
});

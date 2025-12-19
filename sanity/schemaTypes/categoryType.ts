import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => [
        rule.required().error("Category title is required"),
      ],
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error("Slug is required for URL generation"),
      ],
    }),
    defineField({
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Category thumbnail image",
    }),
    defineField({
      name: "parentCategory",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Leave empty for main categories (DOG, CAT, etc.). Set parent for subcategories.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which category appears in navigation",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      parentTitle: "parentCategory.title",
    },
    prepare({ title, media, parentTitle }) {
      return {
        title: parentTitle ? `↳ ${title}` : title,
        subtitle: parentTitle ? `Sub of: ${parentTitle}` : "Main Category",
        media,
      };
    },
  },
});

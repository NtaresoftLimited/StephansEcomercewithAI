import { defineField, defineType } from "sanity";

export const heroImageType = defineType({
    name: "heroImage",
    title: "Hero Image",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "section",
            title: "Section",
            type: "string",
            options: {
                list: [
                    { title: "Hero Home", value: "hero-home" },
                    { title: "Hero Dog", value: "hero-dog" },
                    { title: "Hero Cat", value: "hero-cat" },
                    { title: "Hero Bird", value: "hero-bird" },
                    { title: "Hero Fish", value: "hero-fish" },
                ],
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "image",
            title: "Image",
            type: "image",
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "order",
            title: "Display Order",
            type: "number",
            initialValue: 0,
        }),
    ],
    preview: {
        select: {
            title: "title",
            section: "section",
            media: "image",
        },
        prepare({ title, section, media }) {
            return {
                title,
                subtitle: section,
                media,
            };
        },
    },
});

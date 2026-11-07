"use client";

import { useEffect, useState } from "react";

export type WebsiteMenuItem = { name: string; href: string };
export type WebsiteMenuGroup = {
  title: string;
  href: string;
  items: WebsiteMenuItem[];
};
export type WebsiteCategoryMenu = {
  id: string;
  name: string;
  href: string;
  menu: WebsiteMenuGroup[];
  featuredTitles: string[];
};

type LucyRecord = {
  id: number;
  name: string;
  key: string;
  level: "root" | "group" | "item";
  parent_id: number | null;
  url: string;
  sequence: number;
  featured: boolean;
};

function buildNavigation(records: LucyRecord[]): WebsiteCategoryMenu[] {
  const children = new Map<number, LucyRecord[]>();
  for (const record of records) {
    if (!record.parent_id) continue;
    const list = children.get(record.parent_id) || [];
    list.push(record);
    children.set(record.parent_id, list);
  }
  const ordered = (items: LucyRecord[]) =>
    [...items].sort((a, b) => a.sequence - b.sequence || a.id - b.id);

  const navigation = ordered(records.filter((record) => record.level === "root")).map((root) => {
    const groups = ordered(
      (children.get(root.id) || []).filter((record) => record.level === "group"),
    );
    return {
      id: root.key,
      name: root.name.toUpperCase(),
      href: root.url,
      menu: groups.map((group) => ({
        title: group.name,
        href: group.url,
        items: ordered(
          (children.get(group.id) || []).filter((record) => record.level === "item"),
        ).map((item) => ({ name: item.name, href: item.url })),
      })),
      featuredTitles: groups.filter((group) => group.featured).map((group) => group.name),
    };
  });
  const rootKeys = new Set(navigation.map((category) => category.id));
  const completeRoots =
    rootKeys.has("dogs") &&
    rootKeys.has("cats") &&
    rootKeys.has("birds") &&
    (rootKeys.has("smallPets") || rootKeys.has("small-animals"));
  return completeRoots && navigation.every((category) => category.menu.length) ? navigation : [];
}

let cachedNavigation: WebsiteCategoryMenu[] | null = null;

export function useLucyNavigation() {
  const [categories, setCategories] = useState<WebsiteCategoryMenu[]>(
    cachedNavigation || [],
  );

  useEffect(() => {
    if (cachedNavigation) return;
    let active = true;
    fetch("/api/lucy-navigation", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : { records: [] }))
      .then((payload) => {
        if (!active || !Array.isArray(payload.records)) return;
        const navigation = buildNavigation(payload.records);
        if (navigation.length) {
          cachedNavigation = navigation;
          setCategories(navigation);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return categories;
}

import re

with open("components/app/CategoryMegaMenu.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add ChevronDown import
content = content.replace("import { ElementType, useState } from \"react\";", "import { ElementType, useState } from \"react\";\nimport { ChevronDown } from \"lucide-react\";")

# 2. Add expandedGroups state
component_start = """export function CategoryMegaMenu({
  animalName,
  groups,
  featuredTitles,
  viewAllHref,
  onNavigate,
}: CategoryMegaMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);"""

component_start_new = """export function CategoryMegaMenu({
  animalName,
  groups,
  featuredTitles,
  viewAllHref,
  onNavigate,
}: CategoryMegaMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };"""

content = content.replace(component_start, component_start_new)

# 3. Modify the items slice and hasMoreItems logic
display_items_old = "const displayItems = isExpanded ? group.items : group.items.slice(0, 3);"
display_items_new = """const hasMoreItems = group.items.length > 3;
          const isGroupExpanded = expandedGroups[group.title];
          // If the group is explicitly expanded, show all. Otherwise, limit to 3.
          const displayItems = isGroupExpanded ? group.items : group.items.slice(0, 3);"""
content = content.replace(display_items_old, display_items_new)

# 4. Modify the footer of each category box
footer_old = """<div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5c3e2e] transition-colors hover:text-[#8b4f22] dark:text-amber-500"
                  >
                    View all {group.title}
                    <ArrowRight aria-hidden="true" className="h-3 w-3" />
                  </Link>
                </div>"""

footer_new = """<div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                  {hasMoreItems ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#466986] hover:text-[#30485c] dark:text-blue-400 transition-colors"
                    >
                      {isGroupExpanded ? `View less` : `View all ${group.title.toLowerCase()}`}
                      <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <div />
                  )}
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors ml-auto"
                  >
                    Go to {group.title.toLowerCase()} page
                    <ArrowRight aria-hidden="true" className="h-3 w-3" />
                  </Link>
                </div>"""
content = content.replace(footer_old, footer_new)

with open("components/app/CategoryMegaMenu.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")

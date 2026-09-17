import re

with open("components/app/CategoryMegaMenu.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the footer part
old_footer = """<div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
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

new_footer = """<div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  {hasMoreItems ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {isGroupExpanded ? `Show less` : `View all ${group.title.toLowerCase()}`}
                      <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  ) : null}
                </div>"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    with open("components/app/CategoryMegaMenu.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced footer.")
else:
    print("Could not find old footer.")

"use client";

import { useState } from "react";
import { SearchModal } from "./SearchModal";
import { SecondaryStickyHeader } from "./SecondaryStickyHeader";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <SecondaryStickyHeader isScrolled={true} onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Spacer to prevent content overlap under the fixed Header on all pages */}
      <div className="h-[96px] lg:h-[100px] w-full shrink-0" aria-hidden="true" />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

"use client";

import React from "react";

export function NewsletterForm() {
  return (
    <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
      <input 
        type="email" 
        placeholder="Your email address" 
        className="flex-1 rounded-xl border border-[#E8E0D8] px-5 py-4 focus:outline-none focus:ring-1 focus:ring-[#c77e35] bg-white text-sm shadow-sm"
        required
      />
      <button 
        type="submit" 
        className="bg-[#c77e35] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-wider hover:bg-[#3e220f] transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}

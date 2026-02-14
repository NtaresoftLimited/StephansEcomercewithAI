"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

const SHOP_LINKS = [
    { name: "Dogs", href: "/products?category=dogs" },
    { name: "Cats", href: "/products?category=cats" },
    { name: "Pet Food", href: "/products?category=pet-food" },
    { name: "Accessories", href: "/products?category=accessories" },
];

const SERVICE_LINKS = [
    { name: "Grooming", href: "/grooming" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "My Account", href: "/orders" },
];

const CONTACT_INFO = {
    address: "11 Slipway Rd, Masaki, Dar es Salaam",
    phones: ["+255 786 627 873", "+255 769 324 445"],
    email: "info@stephanspetstore.co.tz",
    hours: "Mon-Sat: 9AM - 8:30PM",
};

export function Footer() {
    return (
        <footer className="bg-background border-t border-border mt-auto">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Section */}
                    <div className="lg:col-span-1 flex flex-col items-start gap-6">
                        <Link href="/" className="inline-block opacity-90 hover:opacity-100 transition-opacity">
                            <Image
                                src="/logo.png"
                                alt="Stephan's Pet Store"
                                width={140}
                                height={40}
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Premium pet food, accessories, and professional grooming for your beloved companions.
                        </p>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground tracking-widest mb-6">SHOP</h3>
                        <ul className="space-y-4">
                            {SHOP_LINKS.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground tracking-widest mb-6">SERVICES</h3>
                        <ul className="space-y-4">
                            {SERVICE_LINKS.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Apps & News */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground tracking-widest mb-6">APPS & NEWS</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Get the Stephan's Pet Store App
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://facebook.com/stephanspetstore"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Facebook className="h-4 w-4" />
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://instagram.com/stephans_ps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Instagram className="h-4 w-4" />
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {/* Placeholder for Tiktok icon if not available, or use text */}
                                    Tiktok
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-sm font-medium text-foreground tracking-widest mb-6">CONTACT</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li>
                                <p>{CONTACT_INFO.address}</p>
                            </li>
                            <li className="flex flex-col gap-1">
                                {CONTACT_INFO.phones.map((phone) => (
                                    <a
                                        key={phone}
                                        href={`tel:${phone.replace(/\s/g, '')}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {phone}
                                    </a>
                                ))}
                            </li>
                            <li>
                                <a
                                    href={`mailto:${CONTACT_INFO.email}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {CONTACT_INFO.email}
                                </a>
                            </li>
                            <li>
                                <p>{CONTACT_INFO.hours}</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground/60">
                        © {new Date().getFullYear()} Stephan&apos;s Pet Store.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

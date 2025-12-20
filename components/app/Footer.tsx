"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle } from "lucide-react";

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
    phone: "+255 786 627 873",
    email: "info@stephanspetstore.co.tz",
    hours: "Mon-Sat: 9AM - 8:30PM",
};

export function Footer() {
    return (
        <footer className="bg-[#6b3e1e] text-white">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/logo.png"
                                alt="Stephan's Pet Store"
                                width={180}
                                height={50}
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-zinc-200 mb-6 leading-relaxed">
                            Tanzania&apos;s premier destination for pet lovers. Premium pet food,
                            accessories, and professional grooming.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com/stephanspetstore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com/stephanspetstore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://wa.me/255786627873"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-white">SHOP</h3>
                        <ul className="space-y-3">
                            {SHOP_LINKS.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-zinc-300 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-white">SERVICES</h3>
                        <ul className="space-y-3">
                            {SERVICE_LINKS.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-zinc-300 hover:text-white transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-white">CONTACT US</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-[#d4a574] shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-300">{CONTACT_INFO.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-[#d4a574] shrink-0" />
                                <a
                                    href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                                >
                                    {CONTACT_INFO.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-[#d4a574] shrink-0" />
                                <a
                                    href={`mailto:${CONTACT_INFO.email}`}
                                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                                >
                                    {CONTACT_INFO.email}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-[#d4a574] shrink-0" />
                                <span className="text-sm text-zinc-300">{CONTACT_INFO.hours}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-zinc-400">
                            © {new Date().getFullYear()} Stephan&apos;s Pet Store. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

"use client"
import Link from "next/link";

export default function Footer() {
    const marketplaceLinks = [
        { name: "Buy a Car", href: "#" },
        { name: "Sell Your Car", href: "#" },
        { name: "Plate Lookup", href: "#" },
        { name: "Price Alerts", href: "#" },
    ];

    const companyLinks = [
        { name: "About Us", href: "#" },
        { name: "How It Works", href: "#" },
        { name: "Contact", href: "#" },
    ];

    const legalLinks = [
        { name: "Terms of Service", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Cookie Policy", href: "#" },
    ];

    return (
        <footer className="relative px-6 md:px-16 lg:px-24 xl:px-32 mt-40 w-full dark:text-slate-50">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-200 dark:border-slate-700 pb-6">
                <div className="md:max-w-80">
                    <a href="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        KiwiCar
                    </a>
                    <p className="mt-6 text-slate-600 dark:text-slate-300">
                        New Zealand&apos;s smartest car marketplace. Buy and sell with confidence using AI-powered tools and official NZTA data.
                    </p>
                    <div className="mt-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <p>hello@kiwicar.co.nz</p>
                        <p>Auckland, New Zealand</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-wrap items-start md:justify-end gap-12 md:gap-16">
                    <div>
                        <h2 className="font-semibold mb-5">Marketplace</h2>
                        <ul className="space-y-2">
                            {marketplaceLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-purple-600 transition">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="space-y-2">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-purple-600 transition">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Legal</h2>
                        <ul className="space-y-2">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-purple-600 transition">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center pb-5 text-slate-500 dark:text-slate-400">
                © 2026 KiwiCar. All rights reserved.
            </p>
        </footer>
    );
};

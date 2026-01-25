"use client"
import SectionTitle from "@/components/SectionTitle";
import { featuresData } from "@/data/featuresData";
import { FaqSection } from "@/sections/FaqSection";

export default function Page() {
    return (
        <>
            <div className="flex flex-col items-center justify-center text-center px-4 bg-[url('/assets/light-hero-gradient.svg')] dark:bg-[url('/assets/dark-hero-gradient.svg')] bg-no-repeat bg-cover">
                <div className="flex flex-wrap items-center justify-center gap-3 p-1.5 pr-4 mt-46 rounded-full border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-600/20">
                    <div className="flex items-center justify-center size-7 rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-xs">Trusted by 10,000+ Kiwi car buyers and sellers</p>
                </div>
                <h1 className="mt-2 text-5xl/15 md:text-[64px]/19 font-semibold max-w-2xl">
                    Buy and sell cars with{" "}
                    <span className="bg-gradient-to-r from-[#923FEF] dark:from-[#C99DFF] to-[#C35DE8] dark:to-[#E1C9FF] bg-clip-text text-transparent">confidence</span>
                </h1>
                <p className="text-base dark:text-slate-300 max-w-lg mt-2">
                    New Zealand&apos;s smartest car marketplace. Check any vehicle&apos;s history with official NZTA data, get AI-powered pricing, and list your car in under 30 seconds.
                </p>
                <div className="flex items-center gap-4 mt-8">
                    <a href="#" className="bg-purple-600 hover:bg-purple-700 transition text-white rounded-md px-6 h-11 flex items-center">
                        Find Your Next Car
                    </a>
                    <a href="#" className="flex items-center gap-2 border border-purple-900 transition text-slate-600 dark:text-white rounded-md px-6 h-11">
                        Sell Your Car
                    </a>
                </div>
            </div>

            <SectionTitle text1="FEATURES" text2="Why Choose KiwiCar" text3="Everything you need to buy or sell with confidence" />

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-4 mt-10 px-6 md:px-16 lg:px-24 xl:px-32">
                {featuresData.map((feature, index) => (
                    <div key={index} className="p-6 rounded-xl space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-80 md:max-w-66">
                        <feature.icon className="text-purple-500 size-8 mt-4" strokeWidth={1.3} />
                        <h3 className="text-base font-medium">{feature.title}</h3>
                        <p className="text-slate-400 line-clamp-2">{feature.description}</p>
                    </div>
                ))}
            </div>

            <FaqSection />

            <div className="flex flex-col items-center text-center justify-center mt-20">
                <h3 className="text-3xl font-semibold mt-16 mb-4">Ready to find your perfect car?</h3>
                <p className="text-slate-600 dark:text-slate-200 max-w-xl mx-auto">
                    Join thousands of Kiwis who buy and sell smarter with KiwiCar.
                </p>
                <div className="flex items-center gap-4 mt-8">
                    <a href="#" className="bg-purple-600 hover:bg-purple-700 transition text-white rounded-md px-6 h-11 flex items-center">
                        Browse Cars
                    </a>
                    <a href="#" className="border border-purple-900 transition text-slate-600 dark:text-white rounded-md px-6 h-11 flex items-center">
                        List Your Car
                    </a>
                </div>
            </div>

        </>
    );
}

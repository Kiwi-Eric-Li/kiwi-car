import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeContextProvider } from "@/context/ThemeContext";
import LenisScroll from "@/components/Lenis";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata = {
    title: "KiwiCar | Buy & Sell Used Cars in New Zealand | AI-Powered Car Marketplace",
    description: "New Zealand's smartest used car marketplace. Check vehicle history with official NZTA data, get AI pricing, and list your car in 30 seconds. Free for buyers and sellers.",
    keywords: "used cars nz, buy car new zealand, sell my car nz, car marketplace nz, vehicle history check nz, wof check online, nzta vehicle lookup",
    openGraph: {
        title: "KiwiCar - Buy & Sell Cars with Confidence",
        description: "New Zealand's AI-powered car marketplace with official NZTA data.",
        url: "https://kiwicar.co.nz",
        siteName: "KiwiCar",
        type: "website",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={poppins.variable}>
                <ThemeContextProvider>
                    <LenisScroll />
                    {children}
                </ThemeContextProvider>
            </body>
        </html>
    );
}

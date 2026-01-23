# KiwiCar Landing Page PRD

**Document Version:** 1.0
**Created:** January 2026
**Status:** Draft
**Type:** Copy Modification Guide

---

## 1. Overview

### 1.1 Purpose

This document defines the copy and content modifications needed to customize the existing Next.js landing page template for KiwiCar - New Zealand's AI-powered used car trading platform.

### 1.2 Template Structure

The landing page uses a Next.js template with the following sections:
- **Navbar** - Navigation links and logo
- **Hero Section** - Main headline, subheadline, social proof, CTAs
- **Company Logos** - Trust badges/social proof marquee
- **Features Section** - 4 feature cards highlighting key value propositions
- **Pricing Section** - 3-tier pricing (to be converted to value proposition)
- **FAQ Section** - Common questions and answers
- **CTA Section** - Final call-to-action
- **Footer** - Links, contact info, copyright

### 1.3 Files to Modify

| File | Purpose |
|------|---------|
| `data/navLinks.js` | Navigation menu items |
| `data/featuresData.js` | Feature cards content |
| `data/pricingData.js` | Value proposition tiers (or remove section) |
| `data/faqsData.js` | FAQ questions and answers |
| `data/companiesLogo.js` | Partner/trust logos |
| `app/(publicPages)/page.jsx` | Hero section copy, CTA text |
| `components/Footer.jsx` | Footer copy, contact info |
| `components/Navbar.jsx` | Logo, CTA buttons |
| `public/assets/` | Logo files, images |

---

## 2. Brand Voice & Messaging

### 2.1 Brand Positioning

**Tagline:** "Buy and sell cars with confidence"

**Value Proposition:** KiwiCar makes used car trading in New Zealand safe, transparent, and effortless through AI-powered vehicle analysis, official NZTA data integration, and smart pricing tools.

### 2.2 Tone of Voice

- **Trustworthy** - Emphasize safety, transparency, official data
- **Modern** - Highlight AI technology without being intimidating
- **Local** - NZ-focused, understands local market
- **Helpful** - Solves real problems for buyers and sellers
- **Simple** - Easy to understand, no jargon

### 2.3 Key Messages

1. **For Buyers:** "Know exactly what you're buying with official NZTA data and AI analysis"
2. **For Sellers:** "List your car in 30 seconds with AI-powered descriptions and smart pricing"
3. **Trust Factor:** "Every vehicle checked against official New Zealand records"

---

## 3. Section-by-Section Copy

### 3.1 Navbar (`data/navLinks.js`)

```javascript
export const navLinks = [
    { name: "Home", href: "/" },
    { name: "Buy a Car", href: "#buy" },
    { name: "Sell Your Car", href: "#sell" },
    { name: "Plate Lookup", href: "#lookup" },
    { name: "How It Works", href: "#how-it-works" },
];
```

**CTA Buttons:**
- Primary: "List Your Car" → Links to frontend app `/sell`
- Secondary: "Sign In" → Links to frontend app `/login`

---

### 3.2 Hero Section (`app/(publicPages)/page.jsx`)

**Social Proof Badge:**
```
"Trusted by 10,000+ Kiwi car buyers and sellers"
```

**Headline:**
```
Buy and sell cars with confidence
```

**Subheadline:**
```
New Zealand's smartest car marketplace. Check any vehicle's history with official NZTA data, get AI-powered pricing, and list your car in under 30 seconds.
```

**Primary CTA:** "Find Your Next Car"
**Secondary CTA:** "Sell Your Car"

**Trust Line (above logo marquee):**
```
"Powered by official data from —"
```

---

### 3.3 Company Logos (`data/companiesLogo.js`)

Replace generic logos with relevant NZ automotive/trust indicators:

| Logo | Purpose |
|------|---------|
| NZTA Logo | Official vehicle data source |
| Waka Kotahi | Transport authority |
| VTNZ | Vehicle testing |
| AA (optional) | Automotive association |

**Note:** Ensure proper licensing/permission for logo usage.

---

### 3.4 Features Section (`data/featuresData.js`)

**Section Title:** "Why Choose KiwiCar"
**Section Subtitle:** "Everything you need to buy or sell with confidence"

```javascript
export const featuresData = [
    {
        icon: ShieldCheckIcon,
        title: "Official NZTA Data",
        description: "Check WOF, Rego, odometer history, and more from official NZ Transport Agency records."
    },
    {
        icon: SparklesIcon,
        title: "AI Smart Pricing",
        description: "Get accurate market valuations based on real NZ sales data. Know the fair price instantly."
    },
    {
        icon: ZapIcon,
        title: "30-Second Listing",
        description: "Enter your plate number, upload photos, and let AI write your description. Done in seconds."
    },
    {
        icon: BellIcon,
        title: "Price Drop Alerts",
        description: "Save your searches and get notified when prices drop on cars you're watching."
    }
];
```

---

### 3.5 "How It Works" Section (New Section - Optional)

Consider adding a step-by-step section:

**For Buyers:**
1. **Search** - Browse thousands of verified listings
2. **Check** - View official vehicle history with one click
3. **Compare** - See AI price analysis vs asking price
4. **Connect** - Message sellers directly through the platform

**For Sellers:**
1. **Enter Plate** - We auto-fill your car details from NZTA
2. **Add Photos** - Upload up to 10 photos
3. **AI Description** - Get a professional listing written for you
4. **Set Price** - Use AI pricing to set a competitive price
5. **Go Live** - Your listing is active in seconds

---

### 3.6 Pricing Section → Value Proposition (`data/pricingData.js`)

**Option A: Remove Pricing Section**
Since KiwiCar is initially free for users, consider removing the pricing section entirely.

**Option B: Convert to "Free vs Premium" Comparison**

```javascript
export const pricingData = [
    {
        title: "Buyers",
        price: "Free",
        priceLabel: "Always free",
        features: [
            { name: "Browse all listings", icon: CheckIcon },
            { name: "3 plate lookups per day", icon: CheckIcon },
            { name: "Save favorites", icon: CheckIcon },
            { name: "Price drop alerts", icon: CheckIcon },
            { name: "Message sellers", icon: CheckIcon },
        ],
        buttonText: "Start Browsing",
    },
    {
        title: "Sellers",
        price: "Free",
        priceLabel: "No listing fees",
        mostPopular: true,
        features: [
            { name: "Unlimited listings", icon: CheckIcon },
            { name: "AI-generated descriptions", icon: CheckIcon },
            { name: "Smart pricing suggestions", icon: CheckIcon },
            { name: "Listing analytics", icon: CheckIcon },
            { name: "Direct buyer messages", icon: CheckIcon },
        ],
        buttonText: "List Your Car",
    },
    {
        title: "Coming Soon",
        price: "Pro",
        priceLabel: "Premium features",
        features: [
            { name: "Unlimited plate lookups", icon: CheckIcon },
            { name: "Featured listings", icon: CheckIcon },
            { name: "Advanced analytics", icon: CheckIcon },
            { name: "Priority support", icon: CheckIcon },
            { name: "Dealer tools", icon: CheckIcon },
        ],
        buttonText: "Join Waitlist",
    }
];
```

---

### 3.7 FAQ Section (`data/faqsData.js`)

```javascript
export const faqsData = [
    {
        question: "What is KiwiCar?",
        answer: "KiwiCar is New Zealand's AI-powered used car marketplace. We combine official NZTA vehicle data with smart AI tools to make buying and selling cars safer, faster, and more transparent."
    },
    {
        question: "How does the plate lookup work?",
        answer: "Enter any NZ plate number and we'll show you the vehicle's official details from NZTA including WOF status, registration expiry, odometer readings, and more. It's the same data used by mechanics and dealers."
    },
    {
        question: "Is KiwiCar free to use?",
        answer: "Yes! Browsing listings, saving favorites, and contacting sellers is completely free. Sellers can list their cars at no cost. We offer premium features for power users coming soon."
    },
    {
        question: "How does AI pricing work?",
        answer: "Our AI analyzes thousands of NZ car sales to estimate fair market value based on make, model, year, mileage, and condition. It helps buyers spot good deals and helps sellers price competitively."
    },
    {
        question: "How fast can I list my car?",
        answer: "Most sellers complete their listing in under 30 seconds. Just enter your plate number (we auto-fill the details), upload a few photos, and our AI writes a professional description for you."
    },
    {
        question: "Is my data safe?",
        answer: "Absolutely. We use industry-standard encryption and never share your personal information. Phone numbers are hidden until you choose to share them with a buyer or seller."
    },
    {
        question: "What areas do you cover?",
        answer: "KiwiCar is available nationwide across New Zealand. You can filter listings by region to find cars near you."
    }
];
```

---

### 3.8 CTA Section (`app/(publicPages)/page.jsx`)

**Headline:**
```
Ready to find your perfect car?
```

**Subheadline:**
```
Join thousands of Kiwis who buy and sell smarter with KiwiCar.
```

**Primary CTA:** "Browse Cars" → Links to `/buy`
**Secondary CTA:** "List Your Car" → Links to `/sell`

---

### 3.9 Footer (`components/Footer.jsx`)

**Tagline:**
```
New Zealand's smartest car marketplace. Buy and sell with confidence using AI-powered tools and official NZTA data.
```

**Navigation Columns:**

**Column 1: "Marketplace"**
- Buy a Car
- Sell Your Car
- Plate Lookup
- Price Alerts

**Column 2: "Company"**
- About Us
- How It Works
- Contact
- Blog (future)

**Column 3: "Legal"**
- Terms of Service
- Privacy Policy
- Cookie Policy

**Contact Info:**
- Email: hello@kiwicar.co.nz
- Location: Auckland, New Zealand

**Copyright:**
```
© 2026 KiwiCar. All rights reserved.
```

---

## 4. Visual Assets Required

### 4.1 Logo

| Asset | Specification |
|-------|---------------|
| `logo-dark.svg` | KiwiCar logo for light backgrounds |
| `logo-light.svg` | KiwiCar logo for dark backgrounds |
| `favicon.ico` | 32x32 favicon |
| `apple-icon.png` | 180x180 Apple touch icon |
| `web-app-manifest-192x192.png` | PWA icon |
| `web-app-manifest-512x512.png` | PWA icon large |

### 4.2 Hero Background

Consider replacing generic gradient with:
- Car-themed subtle pattern
- Abstract road/journey imagery
- Keep clean and professional

### 4.3 Trust Logos

- NZTA / Waka Kotahi logo (with permission)
- Any relevant automotive partner logos

---

## 5. SEO & Metadata

### 5.1 Page Title
```
KiwiCar | Buy & Sell Used Cars in New Zealand | AI-Powered Car Marketplace
```

### 5.2 Meta Description
```
New Zealand's smartest used car marketplace. Check vehicle history with official NZTA data, get AI pricing, and list your car in 30 seconds. Free for buyers and sellers.
```

### 5.3 Keywords
- used cars nz
- buy car new zealand
- sell my car nz
- car marketplace nz
- vehicle history check nz
- wof check online
- nzta vehicle lookup

### 5.4 Open Graph Tags

```html
<meta property="og:title" content="KiwiCar - Buy & Sell Cars with Confidence" />
<meta property="og:description" content="New Zealand's AI-powered car marketplace with official NZTA data." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://kiwicar.co.nz" />
```

---

## 6. Links & CTAs Mapping

| CTA | Destination |
|-----|-------------|
| "Find Your Next Car" | `https://app.kiwicar.co.nz/buy` |
| "Sell Your Car" | `https://app.kiwicar.co.nz/sell` |
| "List Your Car" | `https://app.kiwicar.co.nz/sell` |
| "Sign In" | `https://app.kiwicar.co.nz/login` |
| "Sign Up" | `https://app.kiwicar.co.nz/register` |
| "Plate Lookup" | `https://app.kiwicar.co.nz/lookup` |
| "Start Browsing" | `https://app.kiwicar.co.nz/buy` |

---

## 7. Implementation Checklist

- [ ] Update `data/navLinks.js` with KiwiCar navigation
- [ ] Update `data/featuresData.js` with KiwiCar features
- [ ] Update `data/faqsData.js` with KiwiCar FAQs
- [ ] Update or remove `data/pricingData.js`
- [ ] Update `data/companiesLogo.js` with relevant logos
- [ ] Modify `app/(publicPages)/page.jsx` hero section copy
- [ ] Modify `components/Footer.jsx` footer content
- [ ] Replace logo assets in `public/assets/`
- [ ] Update `app/layout.js` with SEO metadata
- [ ] Update `app/manifest.json` with app info
- [ ] Test all CTA links point to correct frontend app URLs
- [ ] Verify responsive design on mobile
- [ ] Test dark/light mode with new content

---

## 8. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2026 | Initial copy specification | - |

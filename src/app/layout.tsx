import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Motion } from "@/components/Motion";
import { MobileBar } from "@/components/MobileBar";
import { SideContact } from "@/components/SideContact";
import { company } from "@/content/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE = "https://www.deacam.com.au";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Deacam | Industrial Electrical, Automation & Refrigeration Engineering",
    template: "%s | Deacam Engineering",
  },
  description:
    "Industrial electrical, control panels and automation, machine safety, mechanical and refrigeration engineering for operating plants across Victoria, New South Wales and Tasmania. 24/7 breakdown response.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Deacam Engineering",
    images: [{ url: "/img/wg-05.jpg", width: 1500, height: 1125, alt: "Deacam at the West Gate Tunnel precast facility" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "ElectricalContractor",
  name: "Deacam Engineering",
  legalName: company.legalName,
  url: SITE,
  logo: `${SITE}/icon.svg`,
  foundingDate: String(company.founded),
  telephone: "+61 3 9738 0528",
  email: company.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address.street,
    addressLocality: company.address.suburb,
    addressRegion: company.address.state,
    postalCode: company.address.postcode,
    addressCountry: "AU",
  },
  areaServed: ["Victoria", "New South Wales", "Tasmania"],
  sameAs: Object.values(company.social),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Hide reveal targets before first paint only when motion is allowed and JS runs. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;try{if(localStorage.getItem('deacam-motion')==='reduce'){d.dataset.motion='reduce';return}}catch(e){}d.classList.add('motion');setTimeout(function(){if(!window.__motionReady)d.classList.remove('motion')},4000)})();",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </head>
      <body id="top">
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <MobileBar />
        <SideContact />
        <Motion />
      </body>
    </html>
  );
}

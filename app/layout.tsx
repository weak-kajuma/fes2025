import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Noto_Sans_JP } from 'next/font/google'
import { BIZ_UDMincho } from 'next/font/google'
import "./globals.css"
import MenuIcon from "../components/MenuIcon/MenuIcon"
import TabBar from "../components/TabBar/TabBar"
import { unstable_ViewTransition as ViewTransition } from "react"
import { ScrollManager } from "../components/ScrollManager"
import TabBarProvider from "../components/TabBarProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  preload: false,
  variable: '--font-noto-sans-jp',
  display: 'swap',
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'sans-serif'],
})

const mincho = BIZ_UDMincho({
  subsets: ['latin'],
  weight: ['400', '700'],
  preload: false,
  variable: '--font-biz-ud-mincho',
  display: 'swap',
  fallback: ['Hiragino Mincho ProN', 'serif'],
})

export const metadata: Metadata = {
  title: "school festival",
  description: "高槻文化祭のホームページです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=location_on" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${mincho.variable}`}>
        <ViewTransition>
          <TabBarProvider>
            <ScrollManager />
            <MenuIcon />
            <svg style={{ display: 'none' }}>
              <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
                <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
                <feComponentTransfer in="turbulence" result="mapped">
                  <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                  <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                  <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
                </feComponentTransfer>
                <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
                <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lightingColor="white" result="specLight">
                  <fePointLight x="-200" y="-200" z="300" />
                </feSpecularLighting>
                <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
                <feDisplacementMap in="SourceGraphic" in2="softMap" scale="200" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>
            {children}
          </TabBarProvider>
        </ViewTransition>
      </body>
    </html>
  );
}

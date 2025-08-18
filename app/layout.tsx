import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Noto_Sans_JP } from 'next/font/google'
import { BIZ_UDMincho } from 'next/font/google'
import "./globals.css"
import MenuIcon from "../components/MenuIcon/MenuIcon"
import TabBar from "../components/TabBar/TabBar"
import { ScrollManager } from "../components/ScrollManager"
import TabBarProvider from "../components/TabBarProvider"
import { SessionProvider } from "next-auth/react"
import { Bebas_Neue } from 'next/font/google';

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

// const bebasNeue = Bebas_Neue({
//   subsets: ['latin'],
//   weight: '400',
// });

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
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=location_on" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${mincho.variable} `}>
        <SessionProvider>
          {/* <TabBarProvider> */}
            <ScrollManager />
            {/* <MenuIcon /> */}
              {children}
          {/* </TabBarProvider> */}
        </SessionProvider>
      </body>
    </html>
  );
}

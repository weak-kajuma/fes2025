import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Noto_Sans_JP } from 'next/font/google'
import { BIZ_UDMincho } from 'next/font/google'
import "./globals.css"
import MenuIcon from "../components/MenuIcon/MenuIcon"
import TabBar from "../components/TabBar/TabBar"
import { unstable_ViewTransition as ViewTransition } from "react"
import { ScrollManager } from "../components/ScrollManager"

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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansJp.variable} ${mincho.variable}`}>
        <ViewTransition>
          <ScrollManager />
          <MenuIcon />
          <TabBar />
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}

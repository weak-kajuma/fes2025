"use client";
import { usePathname } from "next/navigation";

const comingSoonUrls = [
  "/demo",
  "/map",
  // "/events",
  // "/goods",
];

export default function ComingSoonOverlayClient() {
  const pathname = usePathname();
  const isComingSoon = comingSoonUrls.includes(pathname);
  if (!isComingSoon) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0)",
      color: "#fff",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "3rem",
      fontWeight: "bold",
      fontFamily: "var(--mincho)",
    }}>
      COMING SOON
    </div>
  );
}
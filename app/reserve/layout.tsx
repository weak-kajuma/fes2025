export default function ReserveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
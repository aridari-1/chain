import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header
      style={{
        background: "linear-gradient(90deg, #667eea, #764ba2, #ff6ec4)",
        padding: "15px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo and title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Image
          src="/chain-logo.png"
          alt="Voice Chain Logo"
          width={40}
          height={40}
          style={{ borderRadius: "8px" }}
        />
        <h1 style={{ fontSize: "1.4rem", fontWeight: "600" }}>🎤 Voice Chain</h1>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          Home
        </Link>
        <Link href="/friends" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          Friends
        </Link>
        <Link href="/global" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          Global
        </Link>
      </nav>
    </header>
  );
}

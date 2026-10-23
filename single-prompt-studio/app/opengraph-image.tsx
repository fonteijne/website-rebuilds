import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name}: alles kan met één prompt`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "radial-gradient(circle at 75% 85%, rgba(255,91,34,0.35), #0b0b0c 55%)",
        color: "#f2efe8",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>
        <span style={{ color: "#ff5b22", marginRight: 14 }}>&gt;</span>single_prompt_studio
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 108,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: -4,
        }}
      >
        <span>Alles kan met</span>
        <span style={{ display: "flex", alignItems: "flex-end" }}>
          één prompt.
          <span style={{ width: 46, height: 86, background: "#ff5b22", marginLeft: 12, marginBottom: 8 }} />
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 32, color: "#a29e94" }}>
        Jij beschrijft het resultaat. Wij leveren op. Nul iteraties.
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name}: alles kan met één prompt`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ring = (inset: number, width: number, color: string) => ({
  position: "absolute" as const,
  top: inset,
  left: inset,
  right: inset,
  bottom: inset,
  borderRadius: 9999,
  border: `${width}px solid ${color}`,
  display: "flex",
});

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
        position: "relative",
        background: "#081215",
        color: "#eef5f4",
      }}
    >
      {/* GT-livrei: blauwe band, inktlijn, oranje streep. */}
      <div
        style={{
          position: "absolute",
          right: -300,
          top: -45,
          width: 720,
          height: 720,
          borderRadius: 9999,
          border: "84px solid #abe0e0",
          display: "flex",
        }}
      >
        <div style={ring(22, 40, "#081215")}>
          <div style={ring(4, 32, "#ee7041")} />
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.5 }}>
        <span style={{ color: "#ee7041", marginRight: 14 }}>&gt;</span>single_prompt_studio
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
          <span style={{ width: 46, height: 86, background: "#ee7041", marginLeft: 12, marginBottom: 8 }} />
        </span>
      </div>
      <div style={{ display: "flex", fontSize: 32, color: "#8fa8a9" }}>
        Jij beschrijft het resultaat. Wij leveren op. Nul iteraties.
      </div>
    </div>,
    size,
  );
}

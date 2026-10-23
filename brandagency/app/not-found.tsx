import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] items-center bg-black pt-24">
      <div className="container-x">
        <p className="kicker text-pink">404</p>
        <h1 className="mt-4 text-[clamp(3rem,13vw,10rem)] font-black uppercase leading-[0.85] tracking-tight">
          Lost in
          <br />
          <span className="text-blue">the crowd</span>
        </h1>
        <p className="mt-8 max-w-md text-lg text-paper/70">Deze pagina bestaat niet (meer). Geen zorgen, de weg terug is kort.</p>
        <div className="mt-10">
          <Button href="/">Naar home</Button>
        </div>
      </div>
    </section>
  );
}

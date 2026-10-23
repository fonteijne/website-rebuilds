import ScrollVelocity from '../components/reactbits/ScrollVelocity';

export default function Marquee() {
  return (
    <section className="marquee" aria-label="Kenmerken">
      <div className="marquee__band marquee__band--saffron">
        <ScrollVelocity
          texts={['100% natuurlijk ✺ vegan ✺ klaar in ca. 30 minuten ✺ ']}
          velocity={60}
          className="marquee__text"
          parallaxClassName="marquee__parallax"
          scrollerClassName="marquee__scroller"
          numCopies={4}
        />
      </div>
      <div className="marquee__band marquee__band--red">
        <ScrollVelocity
          texts={['Nyan Switi ✺ sinds 1979 ✺ authentic made simple ✺ ']}
          velocity={-60}
          className="marquee__text"
          parallaxClassName="marquee__parallax"
          scrollerClassName="marquee__scroller"
          numCopies={4}
        />
      </div>
    </section>
  );
}

import { useCallback, useState } from 'react';
import SmoothScroll from './lib/SmoothScroll';
import { ScrollTrigger } from './lib/gsap';
import ClickSpark from './components/reactbits/ClickSpark';
import Noise from './components/reactbits/Noise';
import Preloader from './sections/Preloader';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Marquee from './sections/Marquee';
import Boemboe from './sections/Boemboe';
import Values from './sections/Values';
import Assortment from './sections/Assortment';
import Dishes from './sections/Dishes';
import Retailers from './sections/Retailers';
import Story from './sections/Story';
import Video from './sections/Video';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import RecipeModal from './sections/RecipeModal';

export default function App() {
  const [ready, setReady] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [subject, setSubject] = useState('');

  const onLoaded = useCallback(() => {
    setReady(true);
    // Layout is final once the preloader is gone and fonts/images are in.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <SmoothScroll>
      <ClickSpark sparkColor="#E8A33C" sparkSize={9} sparkRadius={22} sparkCount={9} duration={500}>
        <Preloader onDone={onLoaded} />
        <Nav ready={ready} />
        <main id="top">
          <Hero ready={ready} />
          <Marquee />
          <Boemboe onRecipe={setRecipe} />
          <Values />
          <Assortment onRecipe={setRecipe} />
          <Dishes />
          <Retailers onAsk={() => setSubject('Mijn supermarkt staat er niet tussen')} />
          <Story />
          <Video />
          <Contact subject={subject} setSubject={setSubject} />
        </main>
        <Footer />
        <RecipeModal recipe={recipe} onClose={() => setRecipe(null)} />
        <Noise fixed opacity={0.05} fps={12} zIndex={90} />
      </ClickSpark>
    </SmoothScroll>
  );
}

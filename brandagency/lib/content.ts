import type { StaticImageData } from "next/image";
import { img } from "./images";

export type Accent = "pink" | "blue";

export const site = {
  name: "Brand Agency",
  url: "https://brandagency.nl",
  description:
    "Brand Agency - Uw toonaangevende partner voor doeltreffende Shopper Marketing en Merk activatie. Wij vergroten uw zichtbaarheid en rotatie.",
  email: "info@brandagency.nl",
  phone: "030-633 60 03",
  phoneHref: "tel:+31306336003",
  whatsapp: "06-46 07 77 74",
  whatsappHref: "https://wa.me/31646077774",
  address: "Molenvliet 17, 3961 MT Wijk bij Duurstede",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/brandagency_nl/" },
    { label: "Facebook", href: "https://www.facebook.com/Brand-Agency-111173154837261" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/brandagency-nl/" },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCLTyLafFceX_Q2hEiEq2UlA" },
  ],
  appStore: "https://apps.apple.com/us/app/brand-agency/id1612832790",
  playStore: "https://play.google.com/store/apps/details?id=com.xpslogic.xpsflex.brandagency",
  registration:
    "https://secure.xpslogic.com/service?&client=brandagency&service=registration&module=act&action=applicants&standalone=1",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Brand Activation", href: "/brand-activation" },
  { label: "Shopper Activation", href: "/shopper-activation" },
  { label: "Retail Activation", href: "/retail-activation" },
  { label: "Cases", href: "/cases" },
  { label: "Wie zijn we", href: "/over-brand-agency" },
  { label: "Werken bij Brand Agency", href: "/werken-bij-brand-agency" },
  { label: "Contact", href: "/contact" },
];

/* ------------------------------------------------------------------ */
/* Diensten                                                            */
/* ------------------------------------------------------------------ */

export type ServiceSection = {
  id: string;
  title: string;
  paragraphs: string[];
  cta: string;
  image: StaticImageData;
};

export type Service = {
  slug: "brand-activation" | "shopper-activation" | "retail-activation";
  word: string;
  accent: Accent;
  metaTitle: string;
  metaDescription: string;
  /** Korte tekst voor de horizontale scroll op de homepage. */
  summary: string[];
  homeImage: StaticImageData;
  intro: string;
  body: string[];
  heroImages: [StaticImageData, StaticImageData];
  highlight?: string[];
  sections: ServiceSection[];
  extra?: { title: string; paragraphs: string[] };
  closing: string;
};

export const services: Service[] = [
  {
    slug: "brand-activation",
    word: "Brand",
    accent: "blue",
    metaTitle: "Brand Activation",
    metaDescription:
      "Bij Brand Activation gaat het om het ultieme doel: het stimuleren van het aankoopproces en dat op het juiste moment.",
    summary: [
      "We vertellen niets nieuws… traditionele advertising verliest impact. Als marketeer ga je op zoek naar andere manieren om de boodschap te delen en je doelgroep te bereiken. De behoeften, motivatie en interesses van je doelgroep vertalen wij naar een indrukwekkende merkervaring.",
      "Dat is ons werk en dat klinkt eenvoudig, maar ieder detail moet kloppen: het concept, het moment, de locatie, de setting en passende persoonlijkheden in het (promo)team. Op deze wijze bereiken we het ultieme doel: het stimuleren van het aankoopproces en dat op het juiste moment.",
    ],
    homeImage: img.promoteam,
    intro:
      "Brand Activation: we vertellen niets nieuws… traditionele advertising verliest impact. Als marketeer ga je op zoek naar andere manieren om de boodschap te delen en je doelgroep te bereiken. De behoeften, motivatie en interesses van je doelgroep vertalen wij naar een indrukwekkende merkervaring. Dat is ons werk en dat klinkt eenvoudig, maar ieder detail moet kloppen: het concept, het moment, de locatie, de setting en passende persoonlijkheden in het (promo)team. Op deze wijze bereiken we het ultieme doel: het stimuleren van het aankoopproces en dat op het juiste moment. Dat is brand activation.",
    body: [
      "Je doelgroep vinden wij naast offline ook online. Onze brand activation specialisten vinden online die bepaalde doelgroep zodat wij deze ook offline ontmoeten op de activatiedag. We realiseren meer conversie, vergroten effectief je bereik en bouwen tegelijkertijd aan merkvoorkeur en beleving. We overtuigen je doelgroep door het prikkelen van alle zintuigen (online & offline), door het tastbaar en relevant te maken. Ruiken, voelen en proeven is en blijft de meest effectieve manier om consumenten te overtuigen en je product te gaan gebruiken of te bevestigen dat ze het juiste merk gebruiken.",
      "Bij iedere opdracht gaan wij op zoek naar de juiste brand activation agents voor het product en merk. Geen standaard database van mensen. Net zoals we voor je merk op zoek gaan naar het juist moment, locatie en setting, zoeken we ook dé Brand Agents passend bij wat jij uit wilt stralen en bij je product en merk. Als de persoon in de basis al intrinsiek gemotiveerd is om voor je merk te werken, dan hebben we al een perfect match. Met een training over het product of merk op zak, is de aanvulling compleet en is alles klaar om vooral met heel veel plezier aan het werk te gaan voor je merk.",
    ],
    heroImages: [img.brandActivation1, img.brandActivation2],
    sections: [
      {
        id: "promoteam",
        title: "Promoteam",
        paragraphs: [
          "Onze promoteams vindt je door heel Nederland en België en zijn flexibel, regionaal of landelijk inzetbaar. Met een nearstore promotie vind je ons vooral in winkelcentra om mensen het product te laten proeven om het vervolgens direct te laten kopen bij de gewenste retailer gevestigd in dat winkelcentrum. Maar je vindt ons ook in parken, het OV, parkeergarages en events; eigenlijk overal waar jouw doelgroep is.",
          "Zelfs in het buitenland vinden wij je doelgroep, op een skipiste in Oostenrijk of op het strand van Ibiza of de camping in Salou.",
          "Een promoteam kan op locatie een enorm bereik realiseren tot wel tienduizenden contacten per dag.",
          "Samen met onze promotors creëer je een echte verbinding met je doelgroep. Zij kunnen als geen ander jouw merk tot leven brengen en gaan op persoonlijke wijze het gesprek aan.",
        ],
        cta: "Pick our brains",
        image: img.promoteam,
      },
      {
        id: "sampling",
        title: "Sampling",
        paragraphs: [
          "Het samplen van producten lijkt eenvoudig.",
          "Voor het realiseren van een succesvolle sampling campagne is het van belang dat er een duidelijke visie, doelstellingen en een afgestemd plan achter de campagne zit. Gaat het alleen om de trial aantallen, zijn er bezwaren die we moeten weg halen, dient er snelle (sales) conversie te zijn of is juist de PR waarde van belang? Hoe concreter de visie, des te beter de executie en des te lager de kosten. Proeven is kopen!",
          "Creativiteit kan een groot onderdeel zijn van een sampling campagne. Brand Agency maakt de juiste mix tussen creativiteit en effectiviteit. Wij beheersen en verzorgen de complete operatie van A tot Z tot in de puntjes, hebben alle kennis in huis of werken samen met onze vaste partners. Door rekening te houden met gestelde randvoorwaarden als periode, effectief bereik en uiteindelijke kosten per contact, streven wij naar het hoogst bereikbare resultaat.",
        ],
        cta: "Concreet of nog geen plan?",
        image: img.sampling,
      },
      {
        id: "merchandising",
        title: "Merchandising",
        paragraphs: [
          "Optimale verkrijgbaarheid gecombineerd met een passende zichtbaarheid in de verschillende retail en Out of Home kanalen is key! Van effectieve schappresentatie tot het plaatsen van displays, of een totale winkelinrichting/winkelombouw, wij gaan direct en effectief aan de slag.",
          "Onze merchandisers zorgen voor de juiste prikkel op hét moment en bieden ondersteuning of complete ontzorging van de eigen buitendienst, of daar waar nog geen buitendienst is. We stellen specifieke teams samen, trainen en coachen onze medewerkers passend bij de doelstellingen en DNA van het merk of werkgebied.",
          "Naast onze vaste teams die door de Benelux werken en rijden, verzorgen wij ook flexibel inzetbare merchandisers. Korte lijnen en direct schakelen kenmerkt onze aanpak. Staat er een productintroductie gepland of wil je een specifieke actie onder de aandacht brengen? Deze doorgewinterde mannen en vrouwen trekken er op uit en zorgen voor een strakke presentatie op de winkelvloer. Alle data wordt direct zichtbaar in een online rapportage incl. bewijsmateriaal (foto).",
        ],
        cta: "Tijdelijk of vast team?",
        image: img.merchandising,
      },
      {
        id: "auditing",
        title: "Auditing",
        paragraphs: [
          "Onze auditors controleren en geven inzicht in de correcte executie van commerciële afspraken op de winkelvloer en in de ontwikkeling van assortimenten van zowel doorlopend als tijdelijk product. Category- en marketingmanagers krijgen inzicht in de correcte implementatie van huisstijl, correcte plaatsing van POS materiaal en uitvoer door winkelpersoneel. Thema’s worden goed geïmplementeerd op de winkelvloer, maar mogelijk nog belangrijker… Ook verwijderd.",
          "Door onze aanpak zien we dat Formule management goed inzicht krijgt in een uniforme aanpak van branding op de winkelvloer. Daarnaast wordt het winkelpersoneel niet belast met deze werkzaamheden waarvoor ze niet zijn opgeleid en ze ook niet terug zien in hun beoordelingen.",
          "De innovatieve auditing systemen zorgen ervoor dat werk niet alleen efficiënt maar ook zo effectief mogelijk in het veld wordt uitgevoerd. Deze data wordt per locatie en per dag teruggekoppeld in een online dashboard.",
        ],
        cta: "Wil jij meer zicht krijgen op wat er speelt?",
        image: img.auditing,
      },
      {
        id: "hostesses",
        title: "Hostesses",
        paragraphs: [
          "Het besluit is genomen, je gaat naar een beurs of event. Opvallend aanwezig zijn op een beurs is vaak kostbaar. De tijd en energie die gestoken wordt in de deelname aan de beurs of event, gebruiken wij voor het zoeken van het juiste DNA. Geschikte hostesses op beurzen zijn een belangrijke toevoeging voor succes.",
          "Hostesses vormen vaak de eerste kennismaking met het bedrijf of merk. Aangezien je zelf niet alle eerste indrukken kunt afgeven, is het van het allergrootste belang dat er bekwame medewerkers worden ingeschakeld. Maar waarom dan ook geen inzet met eigen medewerkers? Als geen ander weten zij wat belangrijk is en kennen het verhaal.",
          "Zij kunnen alleen niet alle dagen uit de dagelijkse business worden getrokken, het werk gaat immers ook door. Een combinatie van eigen personeel met dat van ons is vaak een passende oplossing. De beursdagen zijn immers vaak lang en ook nog eens in het weekend. Onze horeca / event toppers, zijn dit gewend en ontzorgen medewerkers op momenten dat ze elders gewenst zijn of gewoon even een luchtje willen scheppen.",
        ],
        cta: "Aanpakker of salestijger?",
        image: img.hostesses,
      },
      {
        id: "roadshow",
        title: "Roadshow",
        paragraphs: [
          "Wij zijn waar het relevant is! Een roadshow is de perfecte oplossing. Met een goed uitgerust voertuig gaan we ‘on the road’. Brand Agency adviseert bij het locatiemanagement, het selecteren van de beste promotielocaties en het aanvragen van de benodigde vergunningen. Wij nemen de voorbereiding voor onze rekening en ontzorgen van concept, branding tot de perfecte executie.",
        ],
        cta: "Challenge ons",
        image: img.roadshow,
      },
      {
        id: "guerilla-marketing",
        title: "Guerilla marketing",
        paragraphs: [
          "Guerilla Marketing bereikt met beperkte middelen een groot resultaat en is erop gericht om in een zeer korte tijd veel media-aandacht of aandacht van publiek te behalen. Deze campagnes zijn veelal een fractie van de kosten die dure campagnes met zich meebrengen.",
          "Het gaat hierbij om ludieke, veelzeggende acties of een bijzondere stunt. De acties zijn snel en effectief en je creëert maximale impact bij je doelgroep. Belangrijk onderdeel is de PR en we werken hierin dan ook samen met je eigen PR bureau om deze campagne viral te krijgen. Improvisatie speelt een belangrijke rol, je weet vooraf nooit precies hoe het zal gaan lopen. Korte lijnen met de opdrachtgever en het uitwerken van scenario’s op voorhand zijn dan ook cruciaal. Bekende varianten van deze vorm van marketing zijn reverse graffiti en flashmobs.",
        ],
        cta: "Challenge ons",
        image: img.guerilla,
      },
    ],
    extra: {
      title: "Online versterkt offline fieldmarketing",
      paragraphs: [
        "Stel je wilt als automerk leads / proefritten genereren. Dan kunnen we met een auto en promoteam naar een plaats met veel traffic rijden. Dan is het sterk de vraag of we daar je klant gaan vinden en wat de kwaliteit van deze leads is. Dat is Brand Activation.",
        "Om het juiste resultaat te krijgen combineren we online met offline. Mensen met een specifiek profiel targeten we via de Socials en we verleiden ze om een kijkje te komen nemen achter het stuur tijdens een roadshow. Door het aanspreken van een specifieke doelgroep, vergroot je het bereik naast de 1-op-1 contacten die op de dag zelf al worden gemaakt.",
      ],
    },
    closing:
      "Ook benieuwd hoe het anders kan? Of wil je graag eens een frisse blik? Graag kijken we samen met je naar jouw uitdagingen. Projectmatig (Ad hoc) of als strategisch partner, wij komen met een concreet plan.",
  },
  {
    slug: "shopper-activation",
    word: "Shopper",
    accent: "pink",
    metaTitle: "Shopper Activation",
    metaDescription:
      "Shopper activatie is het belangrijkste onderdeel van shopper marketing. Hoe zorg je ervoor dat binnen 3 seconden een shopper besluit je product te kopen?",
    summary: [
      "Shopper activatie is het belangrijkste onderdeel van shopper marketing. Hoe zorg je ervoor dat binnen 3 seconden een shopper besluit je product te kopen?",
      "Zo dicht mogelijk op het aankoopmoment aanwezig zijn is het uitgelezen moment in de customer journey om te activeren. Timing is hierbij cruciaal!",
    ],
    homeImage: img.winkeldemonstratie,
    intro:
      "Shopper activatie is het belangrijkste onderdeel van shopper marketing. Hoe zorg je ervoor dat binnen 3 seconden een shopper besluit je product te kopen? Zo dicht mogelijk op het aankoopmoment aanwezig zijn is het uitgelezen moment in de customer journey om te activeren. Timing is hierbij cruciaal!",
    body: [
      "Brand Agency ontwikkelt instore activaties die helpen om de consument op een slimme manier gedurende zijn ‘path of purchase’ te verleiden met opvallende shopper activatie concepten. In een winkel maakt de campagne het verschil. De formule is simpel, kort en krachtig. Voor de perfecte beleving en het persoonlijk karakter voegen we daar een instore demonstratie- en/of samplingteam aan toe.",
      "De shopper verleiden kan ook al vooraf online starten voordat we ze offline verleiden. Met de juiste communicatie zorgen we voor ‘traffic to store’. De juiste inzet van middelen en/of mensen offline zorgt voor conversie op de winkelvloer. In sommige gevallen is het gewenst om na een offline ontmoeting juist online de relatie verder te gaan uitbouwen. Onze manier van shopper activation helpt hierbij.",
    ],
    heroImages: [img.nearStoreBw, img.instoreSamplingBw],
    highlight: [
      "Ruim 70% van de shoppers neemt de beslissing OP de winkelvloer. Juist instore communicatie heeft de grootste invloed op koopgedrag (48%). Zorg dus dat je met shopper activation op de winkelvloer het verschil maakt!",
      "Weet je al welke Touchpoints je gaat inzetten? Weet je hoe je online en offline het beste kunt koppelen om zo een maximaal rendement te halen?",
    ],
    sections: [
      {
        id: "winkeldemonstratie",
        title: "Winkeldemonstratie",
        paragraphs: [
          "Op de winkelvloer daar gebeurd het! Daar wordt >70% van de aankoopbeslissingen genomen. Een winkeldemonstratie laat de consument kennis maken met het product dat ze (nog) niet kennen. Door het persoonlijke karakter en de prikkeling van de zintuigen, krijgt de verkoop van je product een enorme boost.",
          "Bij deze vorm van inzet is direct effect zichtbaar; op een demodag vliegt een veelvoud van de normale dagomzet over de kassa. Maar ook de langere termijn is erg interessant. Naast conversie blijkt dat bij bijna 60% van de shoppers bij een winkeldemonstratie, hun mening over het product of dienst in positieve zin is veranderd.",
          "Bij een winkeldemonstraties denk je al snel aan een activatie moment in een supermarkt. Maar je vind ons ook wit- en bruingoedketens, telecom winkels, bouwmarkten, tuincentra en warenhuizen.",
          "Met onze partners dekken we de hele Benelux af en houden we rekening met de wensen en gebruiken in de regio. Zo werken onze mensen in een regio waar hij of zij bekend is en dat zorgt voor ‘bonding’ met de plaatselijke winkelier en consument.",
        ],
        cta: "Challenge ons",
        image: img.winkeldemonstratie,
      },
      {
        id: "instore-sampling",
        title: "(Instore) sampling",
        paragraphs: [
          "Instore sampling vraagt een aangepaste inzet en kent andere regels dan een normale sampling. We praten over een specifieke doelgroep en afspraken met de betreffende retailer. Het bereik van deze inzet is minder groot, daar tegenover staat dat de conversie ongekend hoog is. Je bereikt de consument op het moment van aankoop op de winkelvloer en bent zichtbaar op de plaats waar je zichtbaar wilt zijn.",
        ],
        cta: "Challenge ons",
        image: img.instoreSampling,
      },
      {
        id: "nearstore",
        title: "Nearstore sampling; the best of both worlds",
        paragraphs: [
          "Als we bereik en conversie met elkaar combineren, hebben we het beste resultaat. Met nearstore sampling zoekt Brand Agency altijd naar creatieve manier waarop een sampling campagne tot realisatie komt.",
          "Door rekening te houden met gestelde randvoorwaarden als tijdsplanning, efficiënt bereik en uiteindelijke kosten per contact, streven wij naar het hoogst bereikbare resultaat. Hierin houden we rekening met en sturen we o.b.v. bruto en netto bereik. Op voorhand kunnen we een inschatting maken van het bereik en de doelstellingen.",
        ],
        cta: "Challenge ons",
        image: img.nearStore,
      },
      {
        id: "pos",
        title: "POS",
        paragraphs: [
          "Display, Rad, Dolly, Proteus, Mr Flexx, schapbanier, vloersticker en/of wobbler, noem het maar op en Brand Agency denkt met je mee. We ontwikkelen en plaatsen POS-materialen bij de verkooppunten en met een totaal rapportage maken we de campagne af.",
          "Op basis van de doelstellingen, denkt het team van Brand Agency mee voor het meest effectieve en passende POS-materiaal.",
        ],
        cta: "Challenge ons",
        image: img.pos,
      },
    ],
    closing:
      "Ook benieuwd hoe shopper activation voor jou werkt? Of wil je graag eens een frisse blik? Graag kijken we samen met je naar jouw uitdagingen. Projectmatig (Ad hoc) of als strategisch partner, wij komen met een concreet plan.",
  },
  {
    slug: "retail-activation",
    word: "Retail",
    accent: "blue",
    metaTitle: "Retail Activation",
    metaDescription:
      "Met onze specialistische kennis en ervaring binnen de verschillende retail kanalen, creëren wij extra beleving op de winkelvloer en stimuleren we het aankoopgedrag.",
    summary: [
      "Met onze specialistische kennis en ervaring binnen de verschillende retail kanalen, creëren wij extra beleving op de winkelvloer, stimuleren we het aankoopgedrag en versterken we de winkelbeleving door een uniforme en kwalitatieve uitstraling van de winkels.",
      "Wij verzorgen een optimale doorvertaling van projecten op de winkelvloer en geven middels auditing en rapportage inzicht in wat er op de winkelvloer speelt.",
    ],
    homeImage: img.conversie,
    intro:
      "Met onze specialistische kennis en ervaring binnen de verschillende retail kanalen, creëren wij extra beleving op de winkelvloer, stimuleren we het aankoopgedrag en versterken we de winkelbeleving door een uniforme en kwalitatieve uitstraling van de winkels. Wij verzorgen een optimale doorvertaling van projecten op de winkelvloer en geven middels auditing en rapportage inzicht in wat er op de winkelvloer speelt.",
    body: [
      "De retail wereld is volop in beweging door veranderend shopper gedrag. Mede door de sterke groei van online bestellen, veranderd de rol van de winkelvloer naar een plaats waar beleving en toegevoegde waarde door advies en inspiratie blijft groeien. Dit is retail activation. Dit zien we in de gehele markt, van JUMBO tot Mediamarkt en van Makro tot Hornbach.",
      "Bij retail formules activeren creëert extra beleving op de winkelvloer. Persoonlijke interactie door sampling of het proeven van een product zet consumenten aan tot het kopen van een product, zorgt voor loyaliteit bij shoppers met een geweldige uplift als resultaat. De afgelopen jaren heeft Brand Agency binnen retail activation voor diverse retailers een ‘brandbook’ of een online activatie platform ontwikkelt passend bij de formule en doelgroep.",
    ],
    heroImages: [img.stopPower, img.conversie],
    sections: [
      {
        id: "merchandising",
        title: "Merchandising / formule ondersteuning",
        paragraphs: [
          "Met ons vaste team en de flexibele schil ondersteunt Brand Agency verschillende retailers bij merchandising opdrachten om zo het eigen winkelpersoneel te laten focussen op dagelijkse bezigheden. Als spil in het web tussen Formule management, Category management, Commercie en Trade marketing zorgen onze merchandisers voor de complete ombouw van het schap of winkel in een zo compact mogelijke tijd. En zorgen onze merchandisers voor een correcte en uniforme uitstraling van elke winkel.",
          "Met onze technische experts met VCA certificaat en of een NEN 3140 of NEN 1010 certificaat bent u verzekerd van kwaliteit op de winkelvoer.",
        ],
        cta: "Challenge ons",
        image: img.retailMerchandising,
      },
      {
        id: "traffic-to-store",
        title: "Traffic to store",
        paragraphs: [
          "Hoe zorg ik ervoor dat de mensen in mijn winkel komen en niet voorbij lopen? Hoe trek ik de aandacht van mijn doelgroep? Hoe kunnen we de gemiddelde besteding verhogen? Retailers als H&M, Ford, Esprit, Belcompany, Vodafone, Hema, hebben allemaal dezelfde uitdagingen en maken inmiddels in verschillende vormen gebruik van ons Activatie Platform. Waar de ene graag met een online platform werkt, prefereert de ander een naslag werk op locatie in boekvorm bij de winkels. Zo dragen we er zorg voor dat alles op een uniforme wijze wordt uitgevoerd.",
        ],
        cta: "Challenge ons",
        image: img.trafficToStore,
      },
      {
        id: "stop-power",
        title: "Stop power",
        paragraphs: [
          "Met de inzet van Holofans genereren we een enorme stoppower bij shoppers. Met een gemiddelde stoppower van 32 seconden tot wel 54 seconden, is de Holofan een ideale tool om uw boodschap op de shopper over te brengen. Opvallend en zichtbaar, zien is geloven! Deze tool is uitermate geschikt voor het plaatsen bij een secondplacement. Compleet integreren in je setting. Wij maken graag een voorstel.",
        ],
        cta: "Challenge ons",
        image: img.holofanBatman,
      },
      {
        id: "engagement",
        title: "Engagement & conversie",
        paragraphs: [
          "Interactie met een robot op de winkelvloer? Het is mogelijk! Door middel van geluid, beweging en verlichting zodat het product in het schap extra onder de aandacht van de consument komt. Door de sensor, weten we wanneer we 1 van onze 5 boodschappen moeten afspelen, om op deze wijzen de shopper een duidelijke call to action te geven. De eerste resultaten bij verschillende retailers zijn verbluffend, een uplift tot 200% zonder afprijzing is inmiddels gerealiseerd. Uit onderzoek blijkt dat 40% van de shoppers met naam en toenaam het merk weet te noemen na ieder winkelbezoek. Voor de Benelux heeft Brand Agency exclusiviteit voor de inzet van deze tool, geschikt voor zowel marketing als sales doeleinden.",
        ],
        cta: "Challenge ons",
        image: img.tokinomo,
      },
    ],
    closing:
      "Ook benieuwd hoe retail activation voor jou werkt? Of wil je graag eens een frisse blik? Graag kijken we samen met je naar jouw uitdagingen. Projectmatig (Ad hoc) of als strategisch partner, wij komen met een concreet plan.",
  },
];

export const getService = (slug: Service["slug"]) => services.find((s) => s.slug === slug)!;

/** Kerncijfers die verspreid over de originele site staan. */
export const stats = [
  { value: 70, prefix: "", suffix: "%", label: "van de shoppers beslist óp de winkelvloer" },
  { value: 48, prefix: "", suffix: "%", label: "invloed van instore communicatie op koopgedrag" },
  { value: 54, prefix: "", suffix: " sec", label: "stoppower met een Holofan" },
  { value: 200, prefix: "", suffix: "%", label: "uplift zonder afprijzing" },
];

/* ------------------------------------------------------------------ */
/* Cases                                                               */
/* ------------------------------------------------------------------ */

export type Case = {
  slug: string;
  title: string;
  image: StaticImageData;
  accent: Accent;
  tag: string;
  paragraphs: string[];
  link?: { label: string; href: string };
  /** Kortere versie voor de homepage. */
  home?: { title: string; paragraphs: string[] };
};

export const cases: Case[] = [
  {
    slug: "bison",
    title: "Bison on tour",
    image: img.bisonTour,
    accent: "pink",
    tag: "Brand Activation",
    paragraphs: [
      "Met de inzet van echte klussers met veel praktijk ervaring, en een gedegen training van Bison (theorie) laten we mensen kennis maken met (de mogelijkheden van) Bison. We helpen klussers en bezoekers van de bouwmarkt op weg door hun vragen te beantwoorden.",
      "Bison biedt voor iedere klus een krachtige oplossing. Om die boodschap kracht bij te zetten brengt Bison actief hun oplossingen onder de aandacht. Na een periode waarin op pad gaan vrijwel niet mogelijk was, staat de BisonTour nu klaar in de startblokken om consumenten weer op te zoeken in samenwerking met Brand Agency. Op een ongedwongen en verrassende manier kunnen ze straks weer klussen zien, zelf doen en geïnspireerd raken.",
      "“Om consumenten te overtuigen is contact met ze hebben noodzakelijk”, zegt Marketing Manager BeNeLux Steven Fitsch. “En om onze producten ‘te beleven’, moet je consumenten naar je toe halen of gaan wij naar hen toe. Het is precies die reden dat we de BisonTour hebben opgezet in samenwerking met Brand Agency. Het draait om zien, doen en geïnspireerd raken.”",
      "Naast de activiteiten in en rond een dhz-winkel zoekt Bison ook consumenten op. Bijvoorbeeld tijdens de Zwarte Cross. Dat doet Bison met het ‘Festival Reparatie Team’. “Op de festival camping rijdt het hele weekend een team rond in het festival busje, om de eerste reparatie hulp bij ongelukken te verlenen aan de festivalbezoekers. Daar laten we zien dat er veel producten in het dagelijkse leven zijn die gerepareerd kunnen worden. Denk bijvoorbeeld aan het plakken van een kapot luchtbed, een tentdoek of zelfs hoe je een noodharing maakt van tape.",
      "De serie Mud Masters Obstacle Run staat dit jaar weer op de planning bij de BisonTour. Bison ziet dat het werkt, dus dat blijven we versterken. Een tweede voordeel van de BisonTour is de creatie van content. Zo biedt het merk al een online knutselplatform aan voor kinderen en is er een online dhz-platform met handige how-to-video’s. Daar deelt Bison kennis en biedt het inspiratie. De content die gemaakt wordt tijdens de events kan hier goed bij worden gebruikt.”",
    ],
  },
  {
    slug: "tokinomo",
    title: "Tokinomo",
    image: img.tokinomo,
    accent: "blue",
    tag: "Retail Activation",
    paragraphs: [
      "In-store marketing is de ultieme klantmagneet voor fysieke winkels. Hoewel het lijkt alsof e-commerceplatforms altijd een stap voor zijn, kunnen fysieke winkels hun klanten geweldige ervaringen bieden vanaf het verkooppunt. Dit is het belangrijkste voordeel van in-store marketingtactieken: ze vinden plaats wanneer de klant betrokken is en klaar is om te winkelen, in tegenstelling tot digitale marketingtactieken die vaak storend kunnen zijn.",
      "Als je eraan denkt om naar de winkel te gaan…. Wat gaat er door je heen? Zie je het als een karwei of als een leuk tijdverdrijf?",
      "De meeste mensen zijn begonnen met het verhogen van hun verwachtingen als het gaat om winkelen. Ze willen niet zomaar naar buiten gaan, een artikel kopen of hun winkelwagentje vullen en dan weer naar huis komen. Ze willen een beleving.",
      "E-commerceplatforms bieden hun klanten geweldige klantervaringen. Een goed voorbeeld is die van Redbull. Dit merk staat erom bekend je vleugels te geven. Daarom besloten ze een stap verder te gaan en geweldige reizen te verzorgen. Op hun website kun je een adembenemende ervaring selecteren, zoals avontuurfoilen met experts. Het enige wat je hoeft te doen is het soort reis te selecteren dat je leuk vindt. Dit is een goed voorbeeld van het combineren van de online met de offline ervaring en tegelijkertijd de kern van het merk te promoten.",
      "De nieuwe generatie POSM: De shelf robotdisplay!",
      "Al tientallen jaren vertrouwt de retail op dezelfde oude in-store marketing- en visuele merchandisingtechnieken om de betrokkenheid en verkoop te vergroten: karton, schapstoppers, bemonsteringscampagnes, prijsverlagingen. Omdat het gedrag van consumenten in een snel tempo verandert, is er een duidelijke vraag naar het verbeteren van de winkelervaring in fysieke winkels. Met Tokinomo: de in-store advertentie-oplossing van de moderne tijd nemen we die plek in.",
      "Brand Agency heeft het exclusieve contract met Tokinomo gesloten om deze nieuwe manier van shopper activatie te kunnen verzorgen voor de Benelux. Prikkel de zintuigen van je shopper (visueel, auditief en kinesthetisch). Door de mogelijkheid van 5 interacties (taglines) te programmeren, krijgen wij de shopper gegarandeerd te pakken voor jou. Met gemiddelden van boven de 180% sales verhoging (zonder afprijzing) is dit de toekomst.",
    ],
  },
  {
    slug: "holofan-batman",
    title: "Holofan Batman",
    image: img.holofanBatman,
    accent: "pink",
    tag: "Shopper Activation",
    paragraphs: [
      "Batman is al decennia een van de meest gekende brands. En toen het nieuws kwam dat er weer een nieuwe film van Batman uitkwam verspreidde dit zich als een lopend vuurtje. Maar net als Batman is Oreo een van de meest gekende brands wereldwijd, en dus is het een voor de hand liggende zet om de twee te koppelen. The Batman Oreo promotiecampagne met limited edition koekjes was een feit. Vanaf half januari 2022, voorafgaand aan de release van de film op 4 maart werd alles beschikbaar voor de retail en dus was het een mooie aanloop naar de release van deze film waar velen naar uit keken over de hele wereld. Mondelez heeft de samenwerking ondersteund met sociale, digitale, PR, out-of-home en in-store marketingondersteuning.",
      "Voor de invulling van de in-store marketingondersteuning is Brand Agency gevraagd om een Shopper Activatie op te zetten voor JUMBO en Albert Heijn in Nederland. Met een duidelijke briefing zijn we aan het werk gegaan. Naast het creatief invullen, moest de shopper activatie passen bij het verhaal en praktisch toepasbaar zijn voor de shopper in de retail omgeving.",
      "De samenwerking van Mondelez en Batman omvat een limited-edition Oreo-koekje met Batman-reliëf, evenals promoties op de verpakking. Shoppers kunnen QR-codes scannen op deelnemende packs om kans te maken op dagelijkse bioscoopkaartjes, evenals een VIP-reis naar Gotham City bij Warner Bros bij World in Abu Dhabi.",
      "Met de inzet van Holofans hebben we Batman tot leven gebracht op de winkelvloer. Op de Holofan was een teaser van The Batman film en Oreo. Door de Holofans strategisch te plaatsen bij de displays, is een enorme impact gemaakt op de winkelvloer. Met een gemiddelde stop powertijd van 31 seconden, was deze Shopper Activatie een groots succes. Net als Batman in de film, vlogen ook hier de verpakkingen de deur uit bij de Retailers in Nederland. Brand Agency heeft Mondelez ontzorgd in het proces van scripting, animatie ontwikkelingen en installatie van de Holofans in Nederland.",
    ],
  },
  {
    slug: "holofan-mondelez-milka",
    title: "Holofan LU Bastogne",
    image: img.holofanLu,
    accent: "blue",
    tag: "Shopper Activation",
    paragraphs: [
      "Mondelez International scoort in het Captain of the Category-onderzoek het beste in de categorie koek, koekjes, banket en tussendoortjes. Een goede basis met sterke A-merken en tegelijkertijd innovatie, zorgen voor het aantrekken van nieuwe kopersgroepen en het verrassen van bestaande kopers.",
      "Activaties, zowel in de media als de winkels, zorgen voor ‘stopping power’, benadrukt Mondelez International. “Power die deze categorie nodig heeft. Confrontatie is voorwaarde nummer één om te kunnen verkopen. Door de sterke merken ‘360 graden’ in te zetten, creëren we meer groeikansen op de winkelvloer.” Hierbij is Mondelez International niet bang om alle tools in te zetten. Middels displays, schapaankleding, banners en nieuwe innovaties… Zo zorgen we voor extra zichtbaarheid.”",
      "Mondelez gaf aan Brand Agency een duidelijke briefing (voor deze shopper activatie) voor de introductie van Bastogne met Kruidnoten in twee varianten; Bastogne en Bastogne met Milka stukjes.",
      "Haal het maximale uit de kast en creëer stopping power! En maak deze tijdelijke introductie tot een passend concept, passend bij de tijd van het jaar. Voor de stopping power hebben we als Brand Agency gekozen voor Holofans. Met een geschikte animatie hebben we de ATL campagne beelden vertaald naar een animatie voor op de Holofan. Door de juiste scripting te gebruiken voor de Holofan hebben we het maximale rendement weten te bereiken. Om het geheel passend bij de tijd van het jaar te maken, hebben we aansluiting gemaakt bij de “schoorsteen” displays. Door de ‘verwerking’ van de Holofans IN de display te maken, werd het één compleet beeld. Deze setting van display in combinatie met de Holofan maakte het geheel tot een compleet spektakel op de winkelvloer. Zo creëerden we een complete beleving aan deze shopper activatie voor deze tijdelijke introductie.",
      "Deze introductie hoorde qua omzet in de top 20 introducties van Nederland, met een omzet van €109.144 per week. Brand Agency heeft Mondelez ontzorgd in het proces van scripting, animatie ontwikkelingen en installatie van de Holofans in Nederland.",
    ],
  },
  {
    slug: "holofan-unilever",
    title: "Holofan Unilever",
    image: img.holofanUnilever,
    accent: "pink",
    tag: "Shopper Activation",
    paragraphs: [
      "Het beste bereiken door het goede te doen: dat is de ambitie van Hanneke Faber, die als president global foods & refreshment wereldwijd verantwoordelijk is voor de voedingsmiddelen bij de Nederlands-Britse voedingsgigant Unilever. En met Graze als merk wordt dat in de praktijk gebracht bij Unilever in Nederland.",
      "Graze is het nieuwe foodsmerk binnen Unilever. Al 12 jaar een begrip in de UK dat nu over is gestapt naar de Nederlandse markt, waar Unilever iedereen kennis willen laten maken met het product. Graze biedt verrassende verantwoorde maar vooral lekkere snacks aan die zowel de hartige als de zoete trek stillen. Alle snacks zijn gemaakt van natuurlijke ingrediënten en bevatten altijd een goed extraatje zoals proteïne, vezels en/ of vitaminen en mineralen, maar de belangrijkste drijfveer is smaak.",
      "Brand Agency kreeg een duidelijke taak. Verhoog de zichtbaarheid van Graze, met als doel om de consument bij Jumbo en Albert Heijn te overtuigen tot aankoop van graze middels haar benefits, smaak, fun en verrassende snacks.",
      "Na het uitwerken van het script door Unilever en Brand Agency om alle elementen terug te laten komen zijn we gestart met de animatie. Na het realiseren van een geweldige HD animatie zijn de Holofans als een rondreizend circus langs de verschillende winkels van JUMBO en Albert Heijn getrokken. De hologrammen waren te zien vanaf 3 t/m 9 mei bij Jumbo en waren in de weken ervoor ook al te zien bij Albert Heijn.",
      "Holografische campagnes zijn nog niet vaak ingezet als communicatiemiddel binnen retail, vandaar dat graze als nieuw merk deze activatie als een mooie kans zag met de juiste fit. Op het hologram is de Chocolate Vanilla oat bite te zien. Door het tonen van de graze-producten in deze nieuwe setting, hoopt graze de consument te inspireren met verantwoorde en vooral smaakvolle alternatieven wanneer hij of zij verleid wordt door ongezonde keuzes.",
      "Anna Westerink, brand manager van graze: ‘Het maken van een verantwoorde keuze is niet altijd makkelijk. Zeker in de supermarkt ervaart de consument veel verleidingen. We spelen in op de behoefte van de moderne consument die lekkere maar ook verantwoorde en duurzame keuzes probeert te maken. Daar sluit deze nieuwe opvallende manier van adverteren goed bij aan.’",
    ],
    link: {
      label: "Lees het persbericht op Emerce",
      href: "https://www.emerce.nl/wire/graze-introduceert-hologram-supermarktvloer-om-zichtbaarheid-verantwoorde-snacks-vergroten",
    },
  },
  {
    slug: "ford",
    title: "Ford",
    image: img.fordPuma,
    accent: "blue",
    tag: "Brand Activation",
    paragraphs: [
      "Hoe kunnen we de doelgroep ervan overtuigen dat de nieuwe Ford Puma echt zo goed is als dat wij zeggen? Dat was de vraag waarmee Ford Nederland bij Brand Agency kwam.",
      "De nieuwe Ford Puma is een cross-over SUV en ontworpen om het maximale uit je moderne levensstijl te kunnen halen. Daarnaast is de Ford Puma ontworpen om je rijplezier te vergroten. En daarom biedt de Ford Puma een reeks technologieën, zoals Ford Co-Pilot 360, selecteerbare rijmodi, Adaptive Cruise Control, Pre Collision Assist en Evasive Steering Assist.",
      "We hebben de bestaande ATL campagne vertaald naar een online en offline BTL campagne. Met een roadshow dwars door Nederland gingen wij op zoek naar de doelgroep voor deze auto.",
      "Door de combinatie te maken tijdens onze roadshow van een promotieteam (brand agents) en de inzet van iemand van de dealer konden we prospects altijd op een juiste wijze te woord staan en hadden we antwoord op (bijna) alle vragen. Doordat data direct na afloop van de activatie dag bij de dealer was, was deze goed en simpel op te volgen met een hoge conversie als resultaat.",
    ],
    home: {
      title: "Ford",
      paragraphs: [
        "Hoe kunnen we de doelgroep ervan overtuigen dat de nieuwe Ford Puma echt zo goed is als wij zeggen? De nieuwe Ford Puma is een cross-over SUV en ontworpen om het maximale uit je moderne levensstijl te halen.",
        "We hebben de ATL campagne vertaald naar een online en BTL campagne. Met een roadshow dwars door Nederland gingen wij op zoek naar de doelgroep voor deze auto. Zowel offline als online, om uiteindelijk zoveel mogelijk proefritten aangevraagd te krijgen!",
      ],
    },
  },
  {
    slug: "f1-bison-pon",
    title: "Bison – Hospitality to the Max",
    image: img.f1Pon,
    accent: "pink",
    tag: "Brand Activation",
    paragraphs: [
      "Het was dan eindelijk zo ver. Na 36 jaar wachten was de Grand Prix van Nederland echt weer terug op de Formule 1-kalender.",
      "Bison en Griffon hebben een groot aantal klanten uitgenodigd vanuit de Benelux, om dit spektakel op hoog kwalitatief niveau te beleven. “Maar hoe komen die mensen van huis op een eenvoudige en gepaste wijze bij het circuit?” Dat was de vraag die men heeft neergelegd bij Brand Agency.",
      "Op een vaste locatie in Haarlem hebben we gezorgd voor een eigen afgesloten parkeerterrein. Hier kon men op vertoon van hun uitnodiging gratis en veilig parkeren. Met duidelijke bewegwijzering was deze locatie eenvoudig bereikbaar. Hier kon men eventueel bijkomen van een lange rit naar locatie toe. Een hapje en drankje waren aanwezig net als een schone toilet.",
      "Hier stonden bussen en fietsen klaar voor alle bezoekers. De verdeling was van te voren bekend via intekening. Met een eigen parkeerservice op 3 locaties in Zandvoort vlakbij het circuit en een eigen bandenplak service werd deze rit zo comfortabel mogelijk gemaakt. Voor sommige minder mobiele mensen die toch wilden fietsen stond een eigen elektrische fiets klaar. Gedurende de dag was er bewaking bij de auto stalling en kon men flexibel heen en terug reizen van en naar het circuit.",
      "Door het van te voren toesturen van een goed verzorgd routeboek werden gasten van te voren over alle details ingelicht en kon de voorpret al beginnen.",
      "Samen met partner Vermaat catering werden de gasten ontvangen in de Vermaat Lounge bij de Hospitality lane. Gasten konden hier gedurende de dag genieten van heerlijk vers bereid eten en een verkoelend drankje. Vanuit de lounge was slechts 150 meter lopen naar de tribune waar een geweldig uitzicht was op het circuit. Mede dankzij 3 geweldige zonnige dagen en de overwinning van Max Verstappen is het een geweldig race weekend geweest voor alle partijen.",
    ],
    home: {
      title: "Bison - Hospitality to the Max",
      paragraphs: [
        "Het was dan eindelijk zo ver. Na 36 jaar wachten was de Grand Prix van Nederland echt weer terug op de Formule 1-kalender. Bison heeft een groot aantal klanten, om dit spectakel op hoog kwalitatief niveau te beleven, uitgenodigd.",
        "Samen met partner Vermaat catering werden de gasten ontvangen in de Vermaat Lounge. Gasten konden in Haarlem hun auto parkeren op een gereserveerde parkeerplaats waar fietsen voor ze klaar stonden om snel bij het circuit te kunnen zijn. Met een eigen parkeer- en bandenplak service, alsmede een hapje en een drankje onderweg en een goed verzorgd routeboek werden gasten maximaal in de watten gelegd.",
      ],
    },
  },
  {
    slug: "somfy",
    title: "Somfy",
    image: img.somfy,
    accent: "blue",
    tag: "Brand Activation",
    paragraphs: [
      "De laatste 3 jaar heeft Somfy NL voor het retailkanaal weinig positief nieuws kunnen brengen. De innovaties blijven uit, de leverbetrouwbaarheid is laag en de levertijden zijn lang. Daarnaast had Somfy de afgelopen 2 jaar met extreem hoge omzetten te maken met enige onzekerheid t.a.v. levertijden. Kortom: Er zijn relatief weinig momenten geweest om echt blij te zijn! Het was dus de hoogste tijd voor een vrolijke noot.",
      "Zo kwam Somfy bij Brand Agency terecht met de vraag “Hoe gaan we weer een glimlach op het gezicht toveren bij onze retailers?”",
      "Binnen een week had Somfy een compleet plan van aanpak inclusief moodboard en was ‘Operatie Somfy Smile’ geboren.",
      "Met de inzet van 2 goed ogende en opgeleide, spontane hostesses werden de ruim 350 dealers bezocht in een tijdsbestek van 3 weken. De hostesses werden voor deze audit door diverse afdelingen getraind om zo, zo goed mogelijk over de bühne te komen.",
      "Met hun gepimpte Fiat 500 was het een lust voor het oog bij aankomst. Met een grote picknickmand met grote opvallende heliumballonnen eraan belden we aan. Ons bezoek was reeds aangekondigd via een e-mailing en bevestiging via de telefoon via ons eigen call center. Onze dames brachten bij hun bezoek diverse zaken in kaart voor Somfy tijdens deze audit. Het gesprek was vooraf gescript op een iPad om zo een consistent verhaal en niveau te kunnen garanderen voor deze audit. In ruil voor deze data trakteerden wij de retailers op een heerlijke versnapering. Dagelijkse verse Donuts (dank aan Dunkin Donuts) en een keuze uit diverse dranken welke zij bij zich hadden. De hostesses waren live te volgen op google maps zodat klanten en relaties wisten waar we ons bevonden. Alle data werd real time teruggekoppeld naar Somfy, zodat de accountmanagers hier gelijk op konden inspelen.",
      "Naast de dagelijkse feedback werd er een wekelijkse terugkoppeling gemaakt. Alle data kwam terug in het PowerBI dashboard welke specifiek voor Somfy was gemaakt. Operatie ‘Somfy Smile’ heeft dankzij deze audit weer een glimlach bij iedereen op het gezicht getoverd.",
    ],
    home: {
      title: "Somfy - Operation Smile",
      paragraphs: [
        "De laatste 3 jaar heeft Somfy NL voor het retailkanaal weinig positief nieuws kunnen brengen. De innovaties blijven uit, de leverbetrouwbaarheid is laag en de levertijden zijn lang. Kortom: Er zijn relatief weinig momenten geweest om echt blij te zijn! Het was dus de hoogste tijd voor een vrolijke noot.",
        "Met de inzet van 2 goed opgeleide en spontane hostesses werden de ruim 350 dealers bezocht in een gepast voertuig. We hebben de Fiat 500 goed laten opvallen. Onze dames brachten bij hun bezoek diverse zaken in kaart voor Somfy en ‘in ruil’ voor deze data trakteerden wij de retailers op een heerlijke versnapering. Dagelijkse verse Donuts met dank aan Dunkin Donuts.",
      ],
    },
  },
];

export const homeCases = ["somfy", "ford", "f1-bison-pon"].map((s) => cases.find((c) => c.slug === s)!);

/* ------------------------------------------------------------------ */
/* Over ons                                                            */
/* ------------------------------------------------------------------ */

export const about = {
  intro: [
    "Brand Agency combineert verschillende fieldmarketing & sales diensten om de consument effectief te bereiken en bedrijven optimaal te ondersteunen. Wij bieden totaaloplossingen van ontwikkeling tot uitvoer waarbij we middels persoonlijke benadering bedrijven, merken, consumenten en retailers met elkaar verbinden en ontzorgen.",
    "Onze medewerkers werken dagelijks vol enthousiasme en onderbouwd met data vanuit meting en expertise voor verschillende merken en retailers in de Benelux.",
    "We ontwikkelen passende marketingstrategieën, efficiënte en doeltreffende campagnes om bedrijven, producten en diensten succesvol te maken, zowel offline als online. Wij zorgen voor het creatieve idee met passende setting, een locatie waar we de doelgroep kunnen bereiken en natuurlijk een gedreven en enthousiast team. We vergroten samen effectief het bereik en creëren zichtbaarheid!",
    "Met 35 jaar bureau ervaring en retailkennis, mogen wij ons specialist noemen op het gebied van instore, nearstore en outdoor promotie. Wij ondersteunen bij het verhogen van de bestaande afzet óf bij het bereiken van nieuwe consumenten, zijn zichtbaar waar men beslist over de aankoop van je product, creëren beleving en brengen je specifieke doelgroep in contact met het product.",
    "Brand Agency werkt samen met diverse retailers en merken in Nederland en België en hebben vaste partners waarmee wij zowel offline als online, een tailormade oplossing voor iedere journey kunnen bieden.",
  ],
  pillars: [
    {
      kicker: "Effectiever en kwalitatiever",
      title: "Data",
      paragraphs: [
        "Door het aanbieden van onze data gedreven totaal oplossingen en het meedenken op de langere termijn zien onze klanten ons als een strategisch partner. We kunnen snel en onderbouwd inspringen op wijzigingen in de markt of behoeftes van onze klanten.",
        "De afgelopen jaren hebben onze medewerkers in het veld veel objectieve data verzameld. Deze relevante gegevens gebruiken wij om onze klanten nog effectiever en kwalitatiever te kunnen ondersteunen.",
      ],
      image: img.over1,
    },
    {
      kicker: "Ons kostbaarste bezit",
      title: "Mensen",
      paragraphs: [
        "Mensen zijn ons kostbaarste bezit en daar zijn wij dan ook zuinig op bij Brand Agency. We vinden het belangrijk dat iedereen in zijn waarde wordt gelaten en starten onze journey met een kennismakingsgesprek waarin wij de wensen van onze opdrachtgever aftasten. Samen met onze recruiters gaan wij op zoek naar de perfecte match voor de langere termijn waardoor het merk, product of dienst een vast gezicht krijgt.",
      ],
      image: img.over2,
    },
    {
      kicker: "Eén aanspreekpunt",
      title: "Van concept tot creatie",
      paragraphs: [
        "Eén aanspreekpunt… Van concept tot campagne, van productie tot uitvoer en van activatie tot evaluatie. Wij brengen beleving, bereik, rotatie en data samen. Ondersteunen bij alle touchpoints in de shopper journey!",
      ],
      image: img.over3,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Werken bij                                                          */
/* ------------------------------------------------------------------ */

export const careers = {
  intro:
    "Ons team bestaat uit medewerkers die je overal tegen kunt komen. Op ons kantoor in Houten, onderweg in de winkels, op locatie bij onze opdrachtgevers of gewoon op de snelweg op weg naar een opdracht. Je herkent ons uit duizenden en wij zijn altijd zichtbaar. Heb jij ons al gespot? Wij geloven namelijk in de kracht van menselijk contact en werken voor en samen met de mooiste bedrijven door Nederland en België.",
  agent: {
    text: "Wil jij een flexibele bijbaan tegen een leuk uurtarief? Dan ben je bij ons aan het juiste adres. Ga aan de slag als Brand Agent en ga werken voor de vetste merken!",
    usps: [
      "Verdien een lekker salaris als freelancer of oproepkracht",
      "Bepaal iedere dag zelf waar en wanneer je werkt",
      "Meld je makkelijk aan via onze app voor werk",
    ],
  },
  app: [
    "Via onze Brand Agency app bepaal jij zelf wanneer je wel en niet kan werken. Onze klussen sturen we uit via een notificatie, het enige wat jij hoeft te doen is je aanmelden!",
    "Bang voor een sleur? Wij ook! Als Brand Agent is geen dag hetzelfde, hoe lekker is dat! Je werkt voor verschillende merken en steeds weer op een andere plek. Zo ben je de ene dag op het station flyers aan het uitdelen en de andere dag sta je op een beurs of in een supermarkt om een product te promoten. De week erop aan de slag op een gaaf evenement of misschien wel op pad om displays te plaatsen in een winkel. Het kan allemaal bij Brand Agency!",
  ],
  who: "Brand Agency is het bureau voor merkactivatie! Wij helpen zowel A-merkfabrikanten als retailers in diverse branches met hun merkactivaties. We hebben sterke wortels in de Fieldmarketingbranche. We organiseren merkactivaties voor mooie opdrachtgevers. Onze merkactivaties vinden plaats op festivals, beurzen, supermarkten, evenementen etc.",
  signup:
    "Zie jij het helemaal zitten met ons? Aarzel dan niet langer en schrijf je direct in. Wij zullen dan snel contact met je opnemen en hopen je snel te kunnen inzetten voor één van onze opdrachten!",
};

export type Job = {
  slug: string;
  title: string;
  type: "field-service" | "kantoor";
  image: StaticImageData;
  sections: { title?: string; paragraphs?: string[]; list?: string[] }[];
  apply: { kind: "link"; href: string } | { kind: "mail"; email: string; name: string };
};

const agentAbout =
  "Brand Agency heeft sterke wortels in de Fieldmarketing branche met ruim 20 jaar ervaring! Brand Agency helpt zowel A-merkfabrikanten als retailers in diverse branches met hun merkactivaties. We organiseren gave merkactivaties per jaar voor mooie opdrachtgevers zoals Bison, Coppa Cocktails, Somfy, Ford etc. Onze merkactivaties vinden onder andere plaats op festivals, beurzen, supermarkten en evenementen.";

const agentSections: Job["sections"] = [
  {
    paragraphs: [
      "Wil jij een flexibele bijbaan tegen een leuk uurtarief? Dan ben je bij ons aan het juiste adres. Ga aan de slag als Brand Agent en ga werken voor de vetste merken!",
      "Bang voor een sleur? Wij ook! Als Brand Agent is geen dag hetzelfde, hoe lekker is dat! Je werkt voor verschillende merken en steeds weer op een andere plek. Zo ben je de ene dag op het station flyers aan het uitdelen en de andere dag sta je op een beurs of in een supermarkt om een product te promoten. De week erop aan de slag op een gaaf event samen met je vrienden of misschien wel op pad om displays te plaatsen in een winkel. Het kan allemaal bij Brand Agency!",
    ],
  },
  {
    title: "Wat bieden wij?",
    list: [
      "Verdien een lekker salaris tussen de €10,- en €18,-",
      "Ga aan de slag als freelancer/ZZP’er of oproepkracht",
      "Bepaal iedere dag zelf waar en wanneer je werkt",
      "Meld je makkelijk aan via onze app voor werk",
      "Je ontvangt een bonus als jij een vriend/vriendin uitnodigt om ook bij ons te komen werken",
      "Rijbewijs is een pré, maar geen must",
      "Ervaring is niet nodig, maar altijd mooi meegenomen",
    ],
  },
  {
    title: "De Brand Agency app",
    paragraphs: [
      "Via onze Brand Agency app bepaal jij zelf wanneer je wel en niet kan werken. Onze klussen sturen we uit via een notificatie, het enige wat jij hoeft te doen is je aanmelden!",
    ],
  },
  { title: "Wie zijn wij?", paragraphs: [agentAbout] },
  {
    title: "Interesse?",
    paragraphs: [
      "Leuk, dat willen wij ook! Schrijf je direct in door op onderstaande button te klikken. We zullen je snel uitnodigen voor een intake gesprek online of bij ons op kantoor! Tot snel!",
    ],
  },
];

export const jobs: Job[] = [
  {
    slug: "brand-agent-promotiemedewerker-events",
    title: "Brand Agent / Promotiemedewerker Events",
    type: "field-service",
    image: img.vacatureEvents,
    sections: agentSections,
    apply: { kind: "link", href: site.registration },
  },
  {
    slug: "brand-agent-promotiemedewerker",
    title: "Brand Agent / Promotiemedewerker",
    type: "field-service",
    image: img.werken1,
    sections: agentSections,
    apply: { kind: "link", href: site.registration },
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    type: "kantoor",
    image: img.vacatureKantoor,
    sections: [
      {
        paragraphs: [
          "Wij zijn op zoek naar een nieuwe collega. Eentje die er vlinders van krijgt. Hartkloppingen. Die er over droomt. Niet van slaapt. Inderdaad, eentje die hopelessly devoted is… to Fieldmarketing!",
        ],
      },
      {
        title: "Wat ga je doen?",
        paragraphs: [
          "Héél kort gezegd organiseer je als project manager… de meest gave projecten. Een instore activatie, festivals of bijvoorbeeld een landelijke roadshow voor een mooi merk. Je hebt een managende rol en bent het aanspreekpunt voor de opdrachtgever en leveranciers. Op één dag doe je honderd dingen. Tegelijkertijd :). Je overlegt met de opdrachtgever over de materialen, je belt onze leverancier om de materialen te bespreken. Vervolgens rijd je naar de locatie voor een opstart van een van de activaties. Halverwege de middag haak je aan bij een brainstorm. Er is namelijk een mooie aanvraag binnengekomen! Nee, de dag is daarna gelukkig nog niet voorbij. Voordat je naar huis gaat check je bij je grafische collega’s de ontwerpen voor de branding. Vergeet niet het artwork door te sturen naar de leveranciers, anders is het niet op tijd klaar voor de activatie! Je bekijkt samen met je collega’s de foto’s van de activaties van vorige week. Even alles nalopen, om ze daarna te wetransferen naar de opdrachtgever. Dit kan zomaar in een notendop jouw werkdag zijn!",
        ],
      },
      {
        title: "Wie zijn wij?",
        paragraphs: [
          agentAbout,
          "Al zeggen we het zelf, er heerst een open en transparante cultuur waar we zelfstandig en keihard werken en elkaar coachen en activeren. Je móét bij ons groeien, zodat wij ook kunnen groeien.",
        ],
      },
      {
        title: "Wie ben jij?",
        paragraphs: ["Vind je het nog leuk? Dan komt hier ons wensenlijstje. Oud Hollands gezegd: ons keiharde eisenpakket:"],
        list: [
          "Je kan op marcom niveau zelfstandig gesprekken voeren, meetings leiden en communiceren",
          "Je hebt aantoonbare ervaring in het zelfstandig organiseren van activaties",
          "Ervaring aan bureauzijde of klantzijde is een pré (we willen niet vissen in andermans vijver, maar bij ons is het water écht warmer)",
          "Op basis van het concept weet jij concrete invulling te geven aan het programma, materialen, personeel, transport en… na ja, je snapt ‘m",
          "Je hebt een afgeronde MBO/HBO opleiding",
          "Nederlands schrijf je (bijna) foutloos",
          "Je bent in het bezit van een rijbewijs. Voor een auto inderdaad. Op de motor een klant ophalen om samen naar de activatie te gaan zien we namelijk niet zo zitten. Misschien heb je zelfs een auto, dat zou mooi zijn, maar is geen must.",
        ],
      },
      {
        title: "Wat bieden wij?",
        paragraphs: [
          "Hadden we al gezegd dat je ook budgetten bewaakt, scherp kan inkopen én creatieve oplossingen zoekt voor allerlei uitdagingen die projecten altijd bieden? Bij deze. Wij willen in gesprek komen met een leuke man of vrouw die ons bureau écht komt versterken. Iemand die bruist van de energie. We hebben veel te bieden, van jou verwachten we dat ook. De arbeidsvoorwaarden zijn marktconform en stemmen we in overleg af op jouw profiel.",
          "Stuur jouw verhaal en al het andere dat je wilt delen inclusief CV naar Yvette Barink.",
        ],
      },
    ],
    apply: { kind: "mail", email: "yvette@brandagency.nl", name: "Yvette Barink" },
  },
];

export const footerColumns = [
  {
    title: "Brand Activation",
    href: "/brand-activation",
    links: [
      ["Promoteam", "/brand-activation#promoteam"],
      ["Sampling", "/brand-activation#sampling"],
      ["Merchandising", "/brand-activation#merchandising"],
      ["Auditing", "/brand-activation#auditing"],
      ["Hostesses", "/brand-activation#hostesses"],
      ["Roadshow", "/brand-activation#roadshow"],
      ["Guerilla marketing", "/brand-activation#guerilla-marketing"],
    ],
  },
  {
    title: "Shopper Activation",
    href: "/shopper-activation",
    links: [
      ["Winkeldemonstratie", "/shopper-activation#winkeldemonstratie"],
      ["(Instore) sampling", "/shopper-activation#instore-sampling"],
      ["Nearstore sampling", "/shopper-activation#nearstore"],
      ["POS", "/shopper-activation#pos"],
    ],
  },
  {
    title: "Retail Activation",
    href: "/retail-activation",
    links: [
      ["Merchandising", "/retail-activation#merchandising"],
      ["Traffic to store", "/retail-activation#traffic-to-store"],
      ["Stop power", "/retail-activation#stop-power"],
      ["Engagement & conversie", "/retail-activation#engagement"],
    ],
  },
  {
    title: "Brand Agency",
    href: "/over-brand-agency",
    links: [
      ["Cases", "/cases"],
      ["Wie zijn we", "/over-brand-agency"],
      ["Werken bij Brand Agency", "/werken-bij-brand-agency"],
      ["Contact", "/contact"],
    ],
  },
] as const;

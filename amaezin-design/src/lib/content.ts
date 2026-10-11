export const site = {
  name: "Amaezin Design",
  url: "https://amaezindesign.nl",
  tagline: "Do it different.",
  description:
    "Amaezin Design is een ontwerpstudio in Wijk bij Duurstede voor grafisch ontwerp, huisstijl en DTP. Van logo tot drukwerk, signing en social media — van A tot Z ontzorgd.",
  phone: "+31 6 24 80 13 18",
  phoneHref: "tel:+31624801318",
  email: "info@amaezindesign.nl",
  location: "Wijk bij Duurstede, UT",
  terms: "/docs/AmaezinDesign_AlgemeneVoorwaarden.pdf",
  socials: [
    { label: "Instagram", link: "https://www.instagram.com/amaezindesign/" },
    { label: "LinkedIn", link: "https://www.linkedin.com/company/amaezindesign/" },
    { label: "Facebook", link: "https://www.facebook.com/amaezindesign/" },
  ],
};

export const nav = [
  { label: "Home", link: "/" },
  { label: "Grafisch ontwerp", link: "/grafisch-ontwerp" },
  { label: "Huisstijl", link: "/huisstijl" },
  { label: "DTP", link: "/dtp" },
  { label: "Portfolio", link: "/portfolio" },
  { label: "Daag ons uit", link: "/contact" },
];

export type Project = {
  slug: string;
  name: string;
  tags: string[];
  image: string;
  /** Background tint used behind the card while the image loads. */
  tint: string;
};

export const projects: Project[] = [
  { slug: "easytoys", name: "EasyToys", tags: ["Logo's", "Posters", "Flyers", "Vloerstickers"], image: "/images/work/easytoys.webp", tint: "#e64c9b" },
  { slug: "helder", name: "Helder", tags: ["Brochure design"], image: "/images/work/helder.webp", tint: "#b9c9c4" },
  { slug: "heineken", name: "Heineken", tags: ["Logo design"], image: "/images/work/heineken.webp", tint: "#1b3a6b" },
  { slug: "martin-van-essen", name: "Martin van Essen", tags: ["Brochure design"], image: "/images/work/martin-van-essen.webp", tint: "#8a7a63" },
  { slug: "nfc-one", name: "NFC One", tags: ["Logo design", "Branding"], image: "/images/work/nfc-one.webp", tint: "#e9a23b" },
  { slug: "dgv-guitars", name: "DGV Guitars", tags: ["Logo design", "Bedrijfskleding"], image: "/images/work/dgv-guitars.webp", tint: "#2a2a2a" },
  { slug: "teamsport-e-karting", name: "TeamSport E-Karting", tags: ["Social media posts", "Posters", "TV-schermen"], image: "/images/work/teamsport-e-karting.webp", tint: "#0d3c8c" },
  { slug: "bakje-geluk", name: "Bakje Geluk", tags: ["Logo design", "Branding"], image: "/images/work/bakje-geluk.webp", tint: "#d63c8a" },
  { slug: "anno-1989", name: "Anno 1989", tags: ["Logo design"], image: "/images/work/anno-1989.webp", tint: "#111111" },
  { slug: "walk-aan-zee", name: "Walk aan Zee", tags: ["Logo design", "Verpakking"], image: "/images/work/walk-aan-zee.webp", tint: "#dcdcdc" },
  { slug: "gewoon-rolf", name: "Gewoon Rolf", tags: ["Logo design", "Visitekaartjes"], image: "/images/work/gewoon-rolf.webp", tint: "#8c1c32" },
  { slug: "oui-sies", name: "Oui-sies", tags: ["Logo design"], image: "/images/work/oui-sies.webp", tint: "#e8e8e8" },
  { slug: "iam-blessed", name: "IAM Blessed", tags: ["Logo design"], image: "/images/work/iam-blessed.webp", tint: "#6b5b55" },
  { slug: "labelezz", name: "Labelezz", tags: ["Logo design"], image: "/images/work/labelezz.webp", tint: "#7a7a7a" },
];

export const testimonials = [
  {
    quote:
      "Snel, tof, omdenken en vriendelijk — enkele pijlers waarmee ik als ondernemer graag samenwerk. Amaezin ontzorgt, verbeeldt, heeft altijd een alternatief voorhanden. Ja, ik ben zeeeeeeer tevreden. Hopende op meer klussen samen!",
    author: "Het Oude Raedthuys",
  },
  {
    quote:
      "Zeer blij met de samenwerking. Mari-Mae bedenkt creatieve visuals en complete huisstijlen voor ons en onze klanten. Zeker een aanrader voor iedereen die nét even wat meer of anders wil.",
    author: "New Marketing Agency",
  },
];

export type Feature = { title: string; text: string; icon: string };

export type Service = {
  slug: "grafisch-ontwerp" | "huisstijl" | "dtp";
  index: string;
  title: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  lead: string[];
  features: Feature[];
  image: string;
};

const more: Feature = {
  title: "En meer…",
  text: "Natuurlijk kunnen we veel meer dan dit. Benieuwd naar alle mogelijkheden? Let us know!",
  icon: "/images/icons/icon_68.png",
};

const designFeatures: Feature[] = [
  {
    title: "Logo ontwerp",
    text: "Herkenbaarheid van jouw bedrijf, merk of organisatie is ‘the key’ voor een goed logo, en de eerste indruk is allesbepalend. Samen komen we tot het perfecte logo!",
    icon: "/images/icons/icon_57.png",
  },
  {
    title: "Flyer / Brochure",
    text: "Print isn’t dead! Integendeel: een knallende flyer of brochure spreekt boekdelen over jou als bedrijf of merk. Van eerste ontwerp tot eindproduct, én (spoed)levering op locatie.",
    icon: "/images/icons/icon_17.png",
  },
  {
    title: "Posters",
    text: "Val op met posters! Breng jouw evenement, actie of informatie onder de aandacht met posters in diverse formaten, of ga voor een opvallende abri in een bushokje.",
    icon: "/images/icons/icon_50.png",
  },
  {
    title: "Visitekaartjes",
    text: "Nu eens écht opvallen met een visitekaartje dat speciaal voor jou is ontworpen? Of pak uit met PVC-visitekaartjes. Dankzij de talloze mogelijkheden springt jouw kaartje eruit.",
    icon: "/images/icons/icon_63.png",
  },
  {
    title: "Verpakking",
    text: "Een unieke indruk achterlaten als je iets verstuurt of weggeeft, dát is pas binnenkomen! Alles waar een logo, afbeelding of tekst op moet, kunnen we ontwerpen en realiseren.",
    icon: "/images/icons/icon_65.png",
  },
  more,
];

export const services: Service[] = [
  {
    slug: "grafisch-ontwerp",
    index: "01",
    title: "Grafisch ontwerp",
    short: "Logo’s, drukwerk, posters, verpakkingen en alles daartussen.",
    metaTitle: "Grafisch ontwerp van A t/m Z",
    metaDescription:
      "Grafisch ontwerp uit Wijk bij Duurstede. Van logo en huisstijl tot drukwerk, signing en online uitingen — opvallend, persoonlijk en uniek.",
    lead: [
      "Amaezin Design is hét adres voor grafisch ontwerp. Met passie, kennis van de laatste trends en een berg motivatie zorgen we ervoor dat jouw bedrijf, merk of organisatie op de juiste manier opvalt. Van een nieuw logo met complete huisstijl tot bijpassend drukwerk, en van signing tot online- en offline communicatiemiddelen: alles is vorm te geven.",
      "Op zoek naar een ontwerpbureau dat buiten de lijntjes kleurt en het nét even persoonlijker en unieker maakt? Dat meedenkt in jouw wensen en ideeën en dit omzet in een opvallend design? Neem dan zeker contact op.",
    ],
    features: designFeatures,
    image: "/images/work/easytoys.webp",
  },
  {
    slug: "huisstijl",
    index: "02",
    title: "Huisstijl",
    short: "Een visuele identiteit die klopt — online én offline.",
    metaTitle: "Huisstijl laten maken",
    metaDescription:
      "Huisstijl maken? Amaezin Design denkt mee en realiseert jouw visuele identiteit van A tot Z: logo, kleuren, fonts, iconen en beeld.",
    lead: [
      "Creëer een visuele identiteit met een pakkende huisstijl. De eerste indruk is allesbepalend: een sterke huisstijl zorgt voor herkenbaarheid, oogt professioneel en wekt vertrouwen. We denken mee, ontwerpen tot in de puntjes en realiseren jouw huisstijl van A tot Z, offline én online. Missie en visie vertalen naar beeld, daar zijn we goed in!",
      "Is jouw huidige huisstijl toe aan een make-over? Ook dan ben je bij ons aan het juiste adres. We bewaken de elementen die erin horen en steken het geheel in een nieuw, uniek jasje.",
    ],
    features: [
      {
        title: "Logovariaties",
        text: "Een doordacht logo is overal inzetbaar. Elementen uit jouw logo vormen de basis van een professionele huisstijl: van icoon tot kleur en van lettertype tot vorm.",
        icon: "/images/icons/icon_57.png",
      },
      {
        title: "Huisstijlkleuren",
        text: "Er zijn ontelbaar veel kleuren en combinaties. Welke past bij jouw bedrijf? Wij zoeken het uit, met gevoel als leidraad: van één basiskleur tot primaire- en steunkleuren die perfect samengaan.",
        icon: "/images/icons/icon_32.png",
      },
      {
        title: "Afbeeldingen",
        text: "Met een uitgebreide beeldbank brengen we de juiste beleving over. Liever eigen beeld? We werken samen met de beste fotografen die jouw pand, producten of diensten vertalen naar beeld.",
        icon: "/images/icons/icon_50.png",
      },
      {
        title: "Iconen & patronen",
        text: "Dol op strakke of juist sierlijke lijnen en vormen? Alles wordt zelf gemaakt, zodat het écht uniek is en persoonlijk bij jouw bedrijf past.",
        icon: "/images/icons/icon_60.png",
      },
      {
        title: "Fonts",
        text: "Lettertypes zijn misschien wel het belangrijkste element van een bruikbare huisstijl. Van klassiek en chique tot modern en strak: we onderzoeken welke fonts jouw bedrijf laten spreken.",
        icon: "/images/icons/icon_63.png",
      },
      more,
    ],
    image: "/images/work/nfc-one.webp",
  },
  {
    slug: "dtp",
    index: "03",
    title: "DTP",
    short: "Drukwerk, print & signing: van flyer tot gevelreclame.",
    metaTitle: "DTP, drukwerk & signing",
    metaDescription:
      "DTP (Desktop Publishing) door Amaezin Design: flyers, folders, brochures, posters, magazines, stickers, indoor & outdoor signing en belettering.",
    lead: [
      "DTP staat voor Desktop Publishing. We brengen het beste van jouw bedrijf, merk of organisatie naar boven. Krachtige vormgeving is méér dan alleen mooi: het vertelt een verhaal en brengt karakter en gevoel tot leven. Vormgeving met functie, dat is ons doel!",
      "We brainstormen graag met je mee, ontwerpen én realiseren van begin tot eind. Denk aan flyers, folders, brochures, posters, magazines, stickers, indoor & outdoor signing en belettering.",
    ],
    features: [
      {
        title: "Drukwerk",
        text: "Print isn’t dead! Een knallende flyer of brochure spreekt boekdelen over jou als bedrijf of merk. We ontzorgen jouw drukwerk van A tot Z, inclusief (spoed)levering op locatie.",
        icon: "/images/icons/icon_17.png",
      },
      {
        title: "Print & signing",
        text: "Opvallen onderweg? Kies voor voertuigbestickering. Of kleed je pand aan met een beachflag, roll-up banner, spandoek, deurmat, raambestickering of gevelreclame. Wij nemen het uit handen.",
        icon: "/images/icons/icon_22.png",
      },
      { ...more, title: "En meer DTP…" },
    ],
    image: "/images/work/teamsport-e-karting.webp",
  },
];

export const cities = [
  { slug: "grafisch-vormgever-wijk-bij-duurstede", name: "Wijk bij Duurstede", local: true },
  { slug: "grafisch-vormgever-doorn", name: "Doorn" },
  { slug: "grafisch-vormgever-houten", name: "Houten" },
  { slug: "grafisch-vormgever-leersum", name: "Leersum" },
  { slug: "grafisch-vormgever-nieuwegein", name: "Nieuwegein" },
  { slug: "grafisch-vormgever-vianen", name: "Vianen" },
] as const;

export type City = (typeof cities)[number];

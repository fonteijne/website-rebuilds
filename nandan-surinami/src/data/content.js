// All copy below is taken from the original nandansurinami.com site.

const commonSteps = (ingredient, firstWait = 20, secondWait = 20) => [
  'Fruit de H. Nandan boemboe gedurende 2 minuten op laag vuur.',
  `Voeg 350-500 gr ${ingredient} toe en meng het geheel.`,
  `Schep geregeld om en voeg na ${firstWait} minuten 100ml water toe voor een lekkere jus.`,
  `Laat het geheel nog ${secondWait} minuten sudderen op laag vuur, waarbij u om de 5 minuten omroert.`,
];

export const boemboes = [
  {
    id: 'roti-kip',
    name: 'Roti Kip Kerrie',
    short: 'Roti Kip',
    tagline: 'Voor een typisch en authentiek Surinaams roti kipgerecht.',
    weight: '70gr',
    pack: '/img/boemboe-roti-kip.webp',
    dish: '/img/dish-roti.webp',
    serves: 'Voor 2-3 personen',
    for: 'Voor o.a. kip en vleesvervangers',
    add: 'Zelf toevoegen: Roti en groente',
    steps: commonSteps('kip'),
    accent: '#E8A33C',
  },
  {
    id: 'broodje-kip',
    name: 'Broodje Kip Kerrie',
    short: 'Broodje Kip',
    tagline: 'Voor een typisch en authentiek Surinaams broodje kipkerrie.',
    weight: '70gr',
    pack: '/img/boemboe-broodje-kip.webp',
    dish: '/img/dish-broodje.webp',
    serves: 'Voor 2-3 personen',
    for: 'Voor o.a. kip en vleesvervangers',
    add: 'Zelf toevoegen: Brood en komkommer op azijn',
    steps: commonSteps('kip'),
    accent: '#D9822B',
  },
  {
    id: 'groente',
    name: 'Kerrie Groente Gerechten',
    short: 'Groente',
    tagline: 'Voor een typisch en authentiek Surinaams kerriegerecht met groenten.',
    weight: '70gr',
    pack: '/img/boemboe-groente.webp',
    dish: '/img/dish-groente.webp',
    serves: 'Voor 2-3 personen',
    for: 'Voor o.a. aardappel (kruimig), spitskool, kouseband, snijbonen, sperziebonen en wortel',
    add: 'Zelf toevoegen: Roti of rijst',
    steps: commonSteps('groente', 10, 15),
    accent: '#6E9E5A',
  },
  {
    id: 'vis',
    name: 'Kerrie Vis Gerechten',
    short: 'Vis',
    tagline: 'Voor een typisch en authentiek Surinaams kerriegerecht met vis.',
    weight: '70gr',
    pack: '/img/boemboe-vis.webp',
    dish: '/img/dish-vis.webp',
    serves: 'Voor 2-3 personen',
    for: 'Voor o.a. visfilet, kabeljauw, garnalen, krab, kreeft en kwikwi',
    add: 'Zelf toevoegen: Roti of rijst en groente',
    steps: commonSteps('vis'),
    accent: '#C9692E',
  },
  {
    id: 'vlees',
    name: 'Kerrie Vlees Gerechten',
    short: 'Vlees',
    tagline: 'Voor een typisch en authentiek Surinaams kerriegerecht met vlees.',
    weight: '70gr',
    pack: '/img/boemboe-vlees.webp',
    dish: '/img/dish-vlees.webp',
    serves: 'Voor 2-3 personen',
    for: 'Voor o.a. lamsvlees, rundvlees, varkensvlees, eendenvlees (doksa)',
    add: 'Zelf toevoegen: Roti of rijst en groente',
    steps: commonSteps('vlees'),
    accent: '#B6251E',
  },
];

export const products = [
  { id: 'doksa', name: 'Doksa Masala', cat: 'masala', desc: 'Maak de lekkerste kerrie eend met onze unieke masala!', sizes: ['80gr', '300gr'], img: '/img/doksa-masala.webp' },
  { id: 'extra-hot', name: 'Extra Hot Masala', cat: 'masala', desc: 'Ben je fan van pittig eten? Probeer dan nu onze extra hot masala!', sizes: ['80gr', '300gr'], img: '/img/extra-hot-masala.webp', hot: true },
  { id: 'lams', name: 'Lams Masala', cat: 'masala', desc: 'Maak de lekkerste kerrie lamsvlees met onze unieke masala!', sizes: ['80gr', '300gr'], img: '/img/lams-masala.webp' },
  { id: 'roti-kip', name: 'Roti Kip Masala', cat: 'masala', desc: 'Maak de lekkerste kip kerrie met onze unieke masala!', sizes: ['80gr', '300gr'], img: '/img/roti-kip-masala.webp' },
  { id: 'vis', name: 'Vis Masala', cat: 'masala', desc: 'Speciaal voor de visliefhebbers hebben wij een unieke masala samengesteld.', sizes: ['80gr', '300gr'], img: '/img/vis-masala.webp' },
  { id: 'kerrie', name: 'Kerrie Masala', cat: 'masala', desc: 'De bekendste specerijenmix uit de Surinaams-Hindostaanse keuken.', sizes: ['80gr', '300gr', '1kg', '5kg'], img: '/img/kerrie-masala.webp' },
  { id: 'achar', name: 'Achar Chutney Masala', cat: 'masala', desc: 'De lekkerste traditionele Surinaamse chutneys maak je met onze H. Nandan Chutney Masala.', sizes: ['80gr', '1kg'], img: '/img/achar-chutney-masala.webp' },
  { id: 'yellow-peas', name: 'Yellow Peas Besan', cat: 'mix', desc: 'H. Nandan Surinami Yellow Peas Besan, versgemalen gele erwten.', sizes: ['400gr', '1kg'], img: '/img/yellow-peas-besan.webp' },
  { id: 'oerdi', name: 'Oerdi Besan', cat: 'mix', desc: 'Hindostaanse peulvruchtensnack met gele erwten of oerdi.', sizes: ['400gr', '1kg'], img: '/img/oerdi-besan.webp' },
  { id: 'bara', name: 'Bara Mix', cat: 'mix', desc: 'Bara is een gefrituurde Surinaams-Hindoestaanse snack, gemaakt van urid (mungbonen) meel en kruiden.', sizes: ['400gr', '1kg'], img: '/img/bara-mix.webp' },
  { id: 'phulauri', name: 'Phulauri Mix', cat: 'mix', desc: 'Gefrituurde balletjes gemaakt van gele spliterwten.', sizes: ['350gr', '1kg'], img: '/img/phulauri-mix.webp' },
];

export const values = [
  { title: '100% Natuurlijk', text: 'Geen kunstmatige voedingsstoffen', icon: '/img/Group-48.svg' },
  { title: 'Vegan producten', text: 'Alleen plantaardige ingrediënten', icon: '/img/Group-49.svg' },
  { title: 'Makkelijk én authentiek', text: 'Klaar in ca. 30 minuten', icon: '/img/Group-50.svg' },
];

export const retailers = [
  { src: '/logos/albert-heijn.webp', alt: 'Albert Heijn' },
  { src: '/logos/vomar.webp', alt: 'Vomar' },
  { src: '/logos/dekamarkt.webp', alt: 'DekaMarkt' },
  { src: '/logos/mcd.webp', alt: 'MCD' },
  { src: '/logos/hanos.webp', alt: 'Hanos' },
  { src: '/logos/plus.webp', alt: 'PLUS' },
  { src: '/logos/coop.webp', alt: 'Coop' },
  { src: '/logos/dirk.webp', alt: 'Dirk' },
];

export const dishes = [
  { img: '/img/serve-lams.webp', title: 'Kerrie lamsvlees', product: 'Lams Masala' },
  { img: '/img/serve-vis.webp', title: 'Kerrie vis met roti', product: 'Vis Masala' },
  { img: '/img/serve-doksa.webp', title: 'Doksa met groente & rijst', product: 'Doksa Masala' },
  { img: '/img/serve-rotikip.webp', title: 'Roti kip kerrie', product: 'Roti Kip Masala' },
];

export const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/nandansurinaminl/' },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100063829434062' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@nandansurinaminl' },
];

export const linktree = 'https://linktr.ee/nandansurinaminl';
export const youtubeId = 'Y0nP0Qlwd1w';

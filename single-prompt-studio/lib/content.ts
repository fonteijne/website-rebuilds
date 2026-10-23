/**
 * Alle copy van singlepromptstudio.com op één plek.
 * Bron: vision.md. Verzin hier geen prijzen, levertijden, klanten of resultaten:
 * die staan bij "Open besluiten" in vision.md en horen pas in de copy als ze vastliggen.
 */

export const site = {
  name: "Single Prompt Studio",
  url: "https://singlepromptstudio.com",
  // Aanname: adres op het eigen domein. Pas aan zodra de mailbox bestaat.
  email: "hallo@singlepromptstudio.com",
  description:
    "Alles kan met één prompt. Jij beschrijft het resultaat, wij nemen de beslissingen, doen het werk en leveren op. Websites, campagnes, prototypes en automatiseringen. Nul iteraties van jouw kant.",
  tagline: "Eén prompt. Klaar.",
};

export const nav = [
  { label: "Demo's", href: "/#demos" },
  { label: "Nul iteraties", href: "/#nul-iteraties" },
  { label: "Werkwijze", href: "/#werkwijze" },
  { label: "Diensten", href: "/#diensten" },
  { label: "Vragen", href: "/#vragen" },
];

export const hero = {
  eyebrow: "Single Prompt Studio",
  title: ["Alles kan met", "één prompt."],
  kinds: ["Websites.", "Campagnes.", "Prototypes.", "Automatiseringen."],
  lead: "Jij beschrijft het resultaat. Wij nemen de beslissingen, doen het werk en leveren op.",
  nots: ["Geen promptskills.", "Geen briefingrondes.", "Nul iteraties van jouw kant."],
};

export type ChipId = "website" | "campagne" | "prototype" | "automatisering" | "anders";

export const promptForm = {
  label: "Wat wil je laten maken?",
  placeholder: "Maak een website voor mijn adviesbureau die bezoekers omzet in kennismakingsgesprekken.",
  // Wisselende voorbeelden in het lege veld (decoratief; de echte placeholder staat hierboven).
  examples: [
    "Maak een website voor mijn adviesbureau die bezoekers omzet in kennismakingsgesprekken.",
    "Lanceer mijn nieuwe coachingtraject met een campagnepagina en een e-mailreeks.",
    "Maak een klikbare demo van mijn app-idee voor het eerste gesprek met investeerders.",
    "Automatiseer mijn intake: van aanvraagformulier tot bevestigingsmail.",
  ],
  chips: [
    { id: "website", label: "Een website", starter: "Ik wil een website voor " },
    { id: "campagne", label: "Een campagne", starter: "Ik wil een campagne voor " },
    { id: "prototype", label: "Een prototype", starter: "Ik wil een klikbaar prototype van " },
    { id: "automatisering", label: "Een automatisering", starter: "Ik wil een automatisering die " },
    { id: "anders", label: "Iets anders", starter: "Ik wil " },
  ] satisfies { id: ChipId; label: string; starter: string }[],
  helper: ["Ik wil", "voor", "zodat"],
  helperNote: "Geen vast format. Schrijf het zoals je het tegen een collega zou zeggen.",
  submit: "Maak van mijn prompt een voorstel",
  support: "Eén prompt als briefing. Een vaste scope en prijs vóór de start.",
  tooShort: "Vertel iets meer: wat wil je laten maken, en voor wie?",
  minLength: 15,
  maxLength: 4000,
};

export const emailStep = {
  title: "Waar mogen we je voorstel naartoe sturen?",
  lead: "Ontvang een concreet voorstel voor jouw opdracht: wat we maken, wat het kost en wanneer het klaar is.",
  yourPrompt: "Jouw prompt",
  edit: "Wijzig",
  label: "Je zakelijke e-mailadres",
  placeholder: "naam@bedrijf.nl",
  submit: "Stuur mijn voorstel",
  sending: "Versturen…",
  marketing: "Stuur me ook nieuwe één-promptvoorbeelden en aanbiedingen.",
  privacy:
    "We gebruiken je adres om je voorstel te sturen en daarover contact te houden. Geen nieuwsbrief, tenzij je dat hierboven aanvinkt.",
  invalidEmail: "Vul een geldig e-mailadres in.",
  error: "Versturen lukte niet. Probeer het opnieuw of mail je prompt naar ons.",
  fallback:
    "Ons aanvraagsysteem is nog niet gekoppeld. Je mailprogramma opent met je prompt erin, zodat je hem direct kunt versturen.",
};

export const thanks = {
  title: "Je prompt is binnen.",
  lead: "Wij vertalen je opdracht naar een concreet aanbod. Geen intakegesprekken of briefingrondes nodig om te starten.",
  yourPrompt: "Jouw opdracht, zoals je hem schreef",
  noPrompt: "Je prompt staat veilig bij ons. Open je bevestigingsmail om hem terug te lezen.",
  stepsTitle: "Wat er nu gebeurt",
  steps: [
    {
      title: "Bevestiging in je inbox",
      text: "Je ontvangt een bevestiging met je oorspronkelijke prompt. Je hoeft niets opnieuw uit te leggen.",
    },
    {
      title: "Wij maken een voorstel",
      text: "We beoordelen je opdracht en leggen vast wat we maken, wat inbegrepen is, welke keuzes we voor je maken, de vaste prijs en de levertermijn.",
    },
    {
      title: "Jij zegt: akkoord, maak het",
      text: "Klopt het voorstel? Eén klik en wij gaan aan de slag. Past je opdracht niet bij wat we doen, dan laten we dat eerlijk weten.",
    },
  ],
  back: "Terug naar de homepage",
};

/** Demo's: voorbeelden van prompt → resultaat. Uitdrukkelijk géén klantcases. */
export const demos = {
  eyebrow: "Demo's",
  title: "Van één zin naar iets echts.",
  lead: "Zo ziet de route van prompt naar resultaat eruit. Dit zijn voorbeelden van onze pakketten, geen klantcases.",
  badge: "Demo",
  items: [
    {
      service: "Prompt → Website",
      prompt: "Maak mijn bedrijf online zichtbaar.",
      result: ["Website", "Teksten", "Contactformulier"],
    },
    {
      service: "Prompt → Campagne",
      prompt: "Lanceer mijn nieuwe dienst.",
      result: ["Campagnepagina", "E-mailreeks", "Social content"],
    },
    {
      service: "Prompt → Prototype",
      prompt: "Maak een demo van mijn app-idee.",
      result: ["Klikbaar prototype", "Kernschermen", "Demo-flow"],
    },
    {
      service: "Prompt → Automatisering",
      prompt: "Automatiseer mijn intake.",
      result: ["Intakeformulier", "Workflow", "Bevestigingsmails"],
    },
  ],
};

export const marquee = [
  "Eén prompt. Klaar.",
  "Jij het idee. Wij de rest.",
  "Van één zin naar iets echts.",
  "Geen promptcursus. Gewoon resultaat.",
  "Stop met chatten. Begin met maken.",
];

export const zero = {
  eyebrow: "Nul iteraties",
  title: "Jij hoeft niet te itereren.",
  lead: "Wij doen de kwaliteitsrondes vóór de oplevering. Nul iteraties gaat over wat we van jóu vragen, niet over hoe hard wij intern werken.",
  versions: ["website_v1.pdf", "website_v2_feedback.pdf", "website_v3_final.pdf", "website_v4_final_echt.pdf"],
  counterLabel: "iteraties van jouw kant",
  rules: [
    {
      title: "Ontbreekt een detail?",
      text: "Niet essentieel? Dan kiezen wij een passende standaard en zetten die in het voorstel.",
    },
    {
      title: "Kan het op meerdere manieren?",
      text: "Wij nemen de ontwerpbeslissing. Daar betaal je ons voor.",
    },
    {
      title: "Hebben we iets nodig?",
      text: "Essentiële dingen, zoals toegang tot een systeem, staan vooraf als voorwaarde in het aanbod.",
    },
    {
      title: "Nieuwe wens na de start?",
      text: "Valt die buiten het afgesproken resultaat, dan is het een nieuwe opdracht. Geen eindeloze revisielus.",
    },
  ],
};

export const steps = {
  eyebrow: "Werkwijze",
  title: "Eén actie per stap.",
  items: [
    {
      n: "01",
      title: "Je schrijft je prompt",
      text: "Wat wil je laten maken, voor wie en waarom. Eén zin mag, een alinea ook.",
    },
    {
      n: "02",
      title: "Je laat je e-mailadres achter",
      text: "Zodat we je voorstel kunnen sturen. Geen account, geen intakegesprek.",
    },
    {
      n: "03",
      title: "Je ontvangt een concreet voorstel",
      text: "Wat we maken, wat inbegrepen is, de vaste prijs en de levertermijn. Vooraf, zwart op wit.",
    },
    {
      n: "04",
      title: "Akkoord? Wij maken het af",
      text: "Wij nemen de beslissingen en leveren op volgens de afgesproken criteria.",
    },
  ],
};

export const services = {
  eyebrow: "Diensten",
  title: "Wat je met één prompt kunt laten maken.",
  lead: "Elk pakket is afgebakend. In je voorstel staat precies wat “klaar” betekent.",
  cta: "Begin met deze prompt",
  items: [
    {
      id: "website" as ChipId,
      name: "Prompt → Website",
      pitch: "Beschrijf je bedrijf. Ontvang je complete website.",
      text: "Pagina's, teksten, vormgeving en een contactmogelijkheid. Aantal pagina's, hosting, domein en koppelingen leggen we vooraf vast.",
      starter: "Ik wil een website voor mijn bedrijf, ",
    },
    {
      id: "campagne" as ChipId,
      name: "Prompt → Campagne",
      pitch: "Beschrijf je aanbod. Ontvang je complete campagnekit.",
      text: "Campagnepagina, e-mailreeks en social content. Publiceren, verzenden of advertentiebudget alleen met jouw aparte toestemming.",
      starter: "Ik wil een campagne om ",
    },
    {
      id: "prototype" as ChipId,
      name: "Prompt → Prototype",
      pitch: "Beschrijf je productidee. Ontvang een klikbare demo.",
      text: "Een tastbare demonstratie van je concept, zonder requirementsdocument. Een prototype, uitdrukkelijk geen productierijpe software.",
      starter: "Ik wil een klikbaar prototype van ",
    },
    {
      id: "automatisering" as ChipId,
      name: "Prompt → Automatisering",
      pitch: "Beschrijf het terugkerende werk. Wij maken de workflow.",
      text: "Binnen vooraf ondersteunde systemen en koppelingen. Toegangen, beheer en grenzen staan in het aanbod.",
      starter: "Ik wil het terugkerende werk automatiseren: ",
    },
  ],
};

/** Structuur van elk voorstel. Getoond als voorbeeld, zonder verzonnen prijs of termijn. */
export const proposal = {
  eyebrow: "Het voorstel",
  title: "Geen vaag “meer informatie”. Een aanbod.",
  lead: "Elk voorstel bevat dezelfde onderdelen, zodat je vóór de start weet waar je aan toe bent.",
  badge: "Voorbeeld",
  example: {
    prompt: "Maak een website voor mijn adviesbureau die bezoekers omzet in kennismakingsgesprekken.",
    rows: [
      { label: "Eindproduct", value: "Website met een duidelijke route naar een kennismakingsgesprek" },
      { label: "Inbegrepen", value: "Pagina's, teksten, vormgeving, afspraakformulier" },
      { label: "Niet inbegrepen", value: "Advertenties, doorlopend beheer" },
      { label: "Onze keuzes", value: "Structuur, tone of voice, beeldstijl" },
      { label: "Nodig van jou", value: "Logo en toegang tot je domein" },
      { label: "Vaste prijs", value: "Staat in jouw voorstel" },
      { label: "Levertermijn", value: "Staat in jouw voorstel" },
    ],
    cta: "Akkoord, maak het",
  },
  includes: [
    "Het concrete eindproduct",
    "Wat inbegrepen en uitgesloten is",
    "De aannames en gekozen standaarden",
    "De vaste prijs",
    "De levertermijn en wanneer die ingaat",
    "Afhankelijkheden en benodigde toegangen",
    "Duidelijke oplevercriteria",
    "Wat nul iteraties voor deze opdracht betekent",
  ],
};

export const faq = {
  eyebrow: "Vragen",
  title: "Eerlijk antwoord.",
  items: [
    {
      q: "Is dit een AI-tool of een chatbot?",
      a: "Nee. Je praat niet met een bot en je bouwt niets zelf. Je dient één opdracht in; wij voeren hem uit. Intern gebruiken we de beste hulpmiddelen, ook AI, maar je koopt een afgemaakt resultaat.",
    },
    {
      q: "Wat betekent “nul iteraties” precies?",
      a: "Dat jij geen feedbackrondes hoeft te draaien om tot de afgesproken oplevering te komen. Wij nemen de ontwerpbeslissingen en doen de kwaliteitsrondes vóór we opleveren. Voldoet de oplevering niet aan de afgesproken criteria, dan lossen we dat op; dat is geen extra wens.",
    },
    {
      q: "Krijg ik na mijn prompt meteen iets gemaakt?",
      a: "Nee. Je prompt is de briefing. Je krijgt eerst een concreet voorstel met scope, prijs en levertermijn. Pas als je akkoord geeft, gaan we maken.",
    },
    {
      q: "Wat kost het?",
      a: "Dat hangt af van je opdracht. Je krijgt altijd een vaste prijs vóór de start, dus nooit een verrassing achteraf.",
    },
    {
      q: "Wat als mijn opdracht niet past?",
      a: "Dan zeggen we dat eerlijk. Alleen opdrachten die we goed kunnen uitvoeren krijgen een aanbod.",
    },
    {
      q: "Wat gebeurt er met mijn e-mailadres?",
      a: "We gebruiken het om je voorstel te sturen en daarover contact te houden. Voorbeelden en aanbiedingen ontvang je alleen als je daar apart voor kiest, en afmelden kan altijd.",
    },
  ],
};

export const finalCta = {
  title: ["Jij het idee.", "Wij de rest."],
  button: "Schrijf je prompt",
};

export const footer = {
  line: "Alles begint met één prompt. Wij maken het af.",
  links: [{ label: "Privacy", href: "/privacy" }],
};

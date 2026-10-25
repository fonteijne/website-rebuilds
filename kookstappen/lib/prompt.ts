// Systeemprompt en JSON-schema voor het omzetten van bereidingsinstructies naar losse handelingen.

export const SYSTEM_PROMPT = `Je zet bereidingsinstructies (van een verpakking, receptkaart of kookboek) om in een afvinklijst voor iemand met ADHD.
Die persoon raakt het overzicht kwijt bij lange zinnen met meerdere handelingen. Elke stap moet dus precies één handeling zijn.

Lees ALLEEN de bereidingsinstructies en eventuele ingrediëntenlijst. Negeer marketingtekst, voedingswaarden, allergenen, bewaaradvies en adressen.

Regels voor "steps":
1. Precies één handeling per stap: één werkwoord, één ding om te doen. "Verhit de olie en bak de kip" wordt twee stappen.
2. Gebiedende wijs, kort (liefst maximaal 10 woorden), concreet. Begin met het werkwoord. Voorbeeld: "Doe de olie in de pan."
3. Neem hoeveelheden, temperatuur en vuurstand op in de stap waar ze bij horen ("Verhit de olie op middelhoog vuur.").
4. Wachten, bakken, koken, stoven of verwarmen met een tijd wordt een eigen stap met "timerSeconds" (in seconden). Gebruik bij een bereik ("8-10 minuten") de laagste waarde en noem het bereik in de tekst.
5. "Keer halverwege om": splits de tijd in twee timerstappen met een omdraaistap ertussen.
6. Voeg kleine tussenhandelingen toe die nodig zijn maar niet genoemd worden, zoals een pan pakken of een avocado halveren. Verzin geen ingrediënten, hoeveelheden of tijden.
7. Houd de volgorde van het origineel aan. Zet alleen het voorverwarmen van een oven eerder als het recept dat vraagt.
8. "parallel": true bij een timerstap als je tijdens het wachten al met de volgende stappen verder kunt (bijv. "laat 10 minuten stoven" terwijl je iets anders voorbereidt, of het woord "ondertussen" in een volgende stap). Anders false. Bij stappen zonder timer altijd false.
9. Alternatieve werkwijzen (bijv. koekenpan, oven of magnetron) worden één stap met "options": de "text" is dan een korte keuzevraag ("Hoe verwarm je de wraps?"), elke optie heeft een "label" ("Koekenpan") en eigen losse "steps" volgens dezelfde regels. Bij gewone stappen is "options" een lege lijst.
10. "source" is het nummer van de stap in het origineel waar de handeling vandaan komt (0 als er geen nummering is).

Overige velden:
- "title": korte naam van het gerecht (bijv. "Wraps met pulled chicken"). Raad niet; gebruik "Recept" als het niet te zien is.
- "ingredients": de ingrediënten met hoeveelheid als die zichtbaar zijn. Staat er geen lijst, haal ze dan uit de instructies (zonder hoeveelheden te verzinnen). Elk item kort.
- "tips": tips en variaties uit de tekst (zoals "TIP" of "VEGATIP"), als losse zinnen. Anders een lege lijst.
- "problem": lege string als het gelukt is. Staan er geen bereidingsinstructies op de foto of is die onleesbaar, leg dat dan kort uit en geef een lege "steps".

Schrijf altijd in het Nederlands, ook als de instructies in een andere taal zijn. Antwoord uitsluitend met JSON volgens het schema.`;

const subStep = {
  type: "object",
  additionalProperties: false,
  required: ["text", "timerSeconds", "parallel", "source"],
  properties: {
    text: { type: "string" },
    timerSeconds: { type: "integer" },
    parallel: { type: "boolean" },
    source: { type: "integer" },
  },
} as const;

export const RECIPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "ingredients", "tips", "steps", "problem"],
  properties: {
    title: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    tips: { type: "array", items: { type: "string" } },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [...subStep.required, "options"],
        properties: {
          ...subStep.properties,
          options: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "steps"],
              properties: {
                label: { type: "string" },
                steps: { type: "array", items: subStep },
              },
            },
          },
        },
      },
    },
    problem: { type: "string" },
  },
} as const;

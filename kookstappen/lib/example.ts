import type { Recipe, Step, SubStep } from "./types";

// Voorbeeld op basis van de verpakking "Wraps met pulled chicken": werkt zonder OpenRouter-key
// en laat zien hoe de AI een recept opknipt.

const s = (source: number, text: string, timerSeconds = 0, parallel = false): SubStep => ({ text, timerSeconds, parallel, source });
const step = (sub: SubStep): Step => ({ ...sub, options: [] });

export const EXAMPLE_RECIPE: Omit<Recipe, "id" | "createdAt"> = {
  title: "Wraps met pulled chicken",
  ingredients: [
    "Groentemix",
    "Mayonaise",
    "Azijn",
    "Kruidenmix",
    "Kipfilets",
    "(Zonnebloem)olie",
    "Kruidige tomatensaus",
    "200 ml water",
    "Avocado's",
    "Wraps",
  ],
  tips: [
    "Lekker met chipotle en geraspte cheddar.",
    "Vegetarisch: vervang de kipfilets door zwarte bonen.",
  ],
  steps: [
    step(s(1, "Pak een kom.")),
    step(s(1, "Doe de helft van de groentemix in de kom.")),
    step(s(1, "Voeg de mayonaise toe.")),
    step(s(1, "Voeg de azijn toe.")),
    step(s(1, "Roer de coleslaw door elkaar.")),
    step(s(1, "Zet de coleslaw apart.")),
    step(s(2, "Leg de kipfilets op een bord.")),
    step(s(2, "Verdeel de kruidenmix over de kipfilets.")),
    step(s(2, "Zet een ruime wok of hapjespan op het vuur.")),
    step(s(2, "Doe de olie in de pan.")),
    step(s(2, "Verhit de olie op middelhoog vuur.")),
    step(s(2, "Leg de kipfilets in de pan.")),
    step(s(2, "Bak de kipfilets 2½ minuut.", 150)),
    step(s(2, "Keer de kipfilets om.")),
    step(s(2, "Bak de andere kant 2½ minuut.", 150)),
    step(s(3, "Voeg de kruidige tomatensaus toe.")),
    step(s(3, "Voeg 200 ml water toe.")),
    step(s(3, "Laat de kip 10 minuten stoven op middelhoog vuur.", 600)),
    step(s(4, "Haal de kipfilets uit de pan.")),
    step(s(4, "Trek de kip met twee vorken uit elkaar.")),
    step(s(4, "Doe de kip terug in de saus.")),
    step(s(4, "Voeg de rest van de groentemix toe.")),
    step(s(4, "Laat alles 2 minuten koken op middelhoog vuur.", 120, true)),
    step(s(5, "Halveer de avocado's en haal de pit eruit.")),
    step(s(5, "Schep het vruchtvlees in een kom.")),
    step(s(5, "Prak de avocado met een vork.")),
    {
      ...s(6, "Hoe verwarm je de wraps?"),
      options: [
        {
          label: "Koekenpan",
          steps: [
            s(6, "Zet een droge koekenpan op het vuur."),
            s(6, "Leg een wrap in de pan."),
            s(6, "Verwarm de wrap 15 seconden.", 15),
            s(6, "Keer de wrap om."),
            s(6, "Verwarm de andere kant 15 seconden.", 15),
            s(6, "Herhaal dit met de andere wraps."),
          ],
        },
        {
          label: "Oven",
          steps: [
            s(6, "Verwarm de oven voor op 200 °C."),
            s(6, "Leg de wraps in een ovenschaal."),
            s(6, "Dek de ovenschaal af."),
            s(6, "Zet de schaal midden in de oven."),
            s(6, "Verwarm 5 minuten (1 minuut bij één wrap).", 300),
            s(6, "Haal de schaal uit de oven."),
          ],
        },
        {
          label: "Magnetron",
          steps: [
            s(6, "Leg de wraps op een magnetronbord."),
            s(6, "Dek de wraps af."),
            s(6, "Verwarm 1 minuut op 750 watt (10 seconden bij één wrap).", 60),
          ],
        },
      ],
    },
    step(s(7, "Zet de wraps, avocado, coleslaw en kip op tafel.")),
  ],
};

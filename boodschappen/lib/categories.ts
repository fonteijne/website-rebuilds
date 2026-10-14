// Volgorde = looproute door de supermarkt.
export const CATEGORIES = [
  { id: "groente", label: "Groente & fruit", color: "#5b9a4a" },
  { id: "brood", label: "Brood & ontbijt", color: "#c98a3c" },
  { id: "zuivel", label: "Zuivel & eieren", color: "#4a8fc2" },
  { id: "vlees", label: "Vlees, vis & vega", color: "#c4574b" },
  { id: "houdbaar", label: "Houdbaar", color: "#8a6b4f" },
  { id: "drinken", label: "Snacks & drinken", color: "#a361b8" },
  { id: "diepvries", label: "Diepvries", color: "#3aa6a0" },
  { id: "huis", label: "Huishouden & verzorging", color: "#6b7bb8" },
  { id: "overig", label: "Overig", color: "#8b8b80" },
] as const;

const KEYWORDS: Record<string, string[]> = {
  groente: ["appel", "peer", "banaan", "sinaasappel", "mandarijn", "citroen", "limoen", "druif", "druiven", "aardbei", "blauwe bes", "framboos", "mango", "ananas", "avocado", "tomaat", "tomaten", "komkommer", "paprika", "ui", "uien", "knoflook", "wortel", "wortels", "sla", "spinazie", "broccoli", "bloemkool", "courgette", "aubergine", "champignon", "prei", "sperzieboon", "sperziebonen", "aardappel", "aardappelen", "zoete aardappel", "fruit", "groente", "kruiden", "basilicum", "peterselie", "koriander", "gember", "radijs", "rucola", "kool", "spitskool", "mais", "pompoen", "biet"],
  brood: ["brood", "boterham", "bolletjes", "broodjes", "croissant", "beschuit", "crackers", "cracker", "muesli", "cruesli", "havermout", "cornflakes", "granola", "pindakaas", "hagelslag", "jam", "honing", "chocoladepasta", "wrap", "wraps", "tortilla", "pita", "bagel", "ontbijtkoek", "stokbrood"],
  zuivel: ["melk", "yoghurt", "yogurt", "kwark", "vla", "karnemelk", "kaas", "boter", "margarine", "room", "slagroom", "creme fraiche", "eieren", "ei", "mozzarella", "feta", "parmezaan", "roomkaas", "skyr", "havermelk", "sojamelk", "amandelmelk", "halvarine", "cottage cheese"],
  vlees: ["kip", "kipfilet", "gehakt", "worst", "rookworst", "spek", "bacon", "ham", "salami", "biefstuk", "karbonade", "vis", "zalm", "tonijn", "garnalen", "kabeljauw", "vlees", "schnitzel", "tofu", "tempeh", "vegaburger", "falafel", "hummus", "beleg", "filet americain", "leverworst"],
  houdbaar: ["pasta", "spaghetti", "penne", "macaroni", "rijst", "noodles", "couscous", "bloem", "suiker", "zout", "peper", "olie", "olijfolie", "azijn", "saus", "tomatensaus", "pesto", "ketchup", "mayonaise", "mosterd", "soep", "bouillon", "blik", "kikkererwten", "bonen", "linzen", "mais", "tomatenpuree", "pelati", "kruiden", "specerijen", "baking", "bakpoeder", "kokosmelk", "noten", "pinda's", "rozijnen", "thee", "koffie", "sambal", "ketjap", "sojasaus"],
  drinken: ["water", "cola", "fanta", "sprite", "sap", "limonade", "bier", "wijn", "prosecco", "chips", "nootjes", "koekjes", "koek", "chocolade", "snoep", "drop", "reep", "popcorn", "ice tea", "frisdrank", "spa", "energy", "borrelnootjes", "stroopwafel", "biscuit"],
  diepvries: ["ijs", "diepvries", "friet", "frites", "pizza", "doperwten", "spinazie diepvries", "bladerdeeg", "visstick", "kroket", "bitterballen", "loempia", "diepvriesgroente", "ijsblokjes"],
  huis: ["wc-papier", "toiletpapier", "keukenrol", "keukenpapier", "tissues", "zakdoekjes", "afwasmiddel", "vaatwas", "vaatwastabletten", "wasmiddel", "wasverzachter", "schoonmaak", "allesreiniger", "spons", "vuilniszak", "vuilniszakken", "tandpasta", "tandenborstel", "shampoo", "conditioner", "douchegel", "zeep", "deodorant", "scheerschuim", "maandverband", "tampons", "wattenschijfjes", "luiers", "batterijen", "gloeilamp", "aluminiumfolie", "bakpapier", "plastic zakjes", "kattenbakkorrels", "kattenvoer", "hondenvoer", "bleek", "ontkalker"],
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").trim();
}

export function categorize(text: string): string {
  const t = norm(text);
  const words = t.split(/[^a-z0-9'-]+/).filter(Boolean);
  let best: { cat: string; score: number } | null = null;
  for (const [cat, list] of Object.entries(KEYWORDS)) {
    for (const k of list) {
      const key = norm(k);
      let score = 0;
      if (t === key) score = 100;
      else if (words.includes(key)) score = 50 + key.length;
      else if (key.length >= 4 && t.includes(key)) score = key.length;
      if (score && (!best || score > best.score)) best = { cat, score };
    }
  }
  return best?.cat ?? "overig";
}

export function parseItem(raw: string): { text: string; qty: number } {
  let s = raw.trim().replace(/\s+/g, " ");
  let qty = 1;
  let m = s.match(/^(\d{1,2})\s*(?:x|×|st\.?|stuks?)?\s+(.+)$/i);
  if (m) {
    qty = parseInt(m[1], 10);
    s = m[2];
  } else if ((m = s.match(/^(.+?)\s+(\d{1,2})\s*(?:x|×|st\.?|stuks?)$/i))) {
    s = m[1];
    qty = parseInt(m[2], 10);
  }
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return { text: s.slice(0, 60), qty: Math.min(Math.max(qty, 1), 99) };
}

export function normKey(text: string) {
  return norm(text);
}

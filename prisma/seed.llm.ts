/** biome-ignore-all lint/suspicious/noExplicitAny: only seed */
/** biome-ignore-all lint/suspicious/noConsole: its fine */
// @ts-nocheck
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { mkdirSync, existsSync } from "node:fs";
import { faker } from "@faker-js/faker";
import {
  BillingInterval,
  DiscountType,
  EventRole,
  EventStatus,
  EventVisibility,
  LocationType,
  MembershipRole,
  OrderStatus,
  PaymentState,
  PaymentStatus,
  PrismaClient,
  QuestionType,
  RsvpStatus,
  SubscriptionStatus,
  TicketVisibility,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import { getAvatarURL } from "@/lib/config/routes";
  
const prisma = new PrismaClient();

// --- LLM CONFIGURATION -------------------------------------
const LLM_API_KEY = 

"fd1e37fc956f0b868f19984b4264514fa4d55f30fd24319877c0e6bfc6192f5c"
const LLM_BASE_URL = process.env.LLM_BASE_URL || "https://api.together.xyz/v1";
const LLM_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";
const USE_LLM = process.env.USE_LLM === "true";
// --- CONFIG (UNCHANGED) -----------------------------------
const NUM_USERS = 300;
const NUM_COMMUNITIES = 50;
const MAX_EVENTS_PER_COMMUNITY = 15;
const EXTRA_STANDALONE_EVENTS = 100;
const MAX_TICKET_TIERS_PER_EVENT = 4;
const MAX_PROMO_CODES_PER_EVENT = 4;
const MAX_REG_QUESTIONS_PER_EVENT = 5;
const MAX_COLLABORATORS_PER_EVENT = 4;
const MAX_CATEGORIES = 30; 

const ACCESS_KEY = "YVL2f8WFV8VyM_htL_6t9IadGgTufVB6WgATOiA72jE";
const COLLECTION_ID = "j7hIPPKdCOU";

const SHOULD_WIPE = true;
// 'wipe' (default) = wipe everything except Location; 'append' = keep all and add more
const SEED_MODE = (process.env.SEED_MODE || "wipe").toLowerCase();

// --- VENUE LISTS BY CITY -----------------------------------
const VENUES_BY_CITY = {
  "New York City": [
    "WeWork Union Square",
    "Brooklyn Bowl",
    "The High Line Hotel",
    "Stone Street Tavern",
    "Pier 17",
    "The Jane Hotel",
    "Governors Island",
    "Brooklyn Bridge Park",
    "Hudson Yards",
    "Bryant Park",
  ],
  "San Francisco": [
    "Moscone Center",
    "The Fillmore",
    "Fort Mason",
    "Pier 70",
    "Mission Bay Conference Center",
    "UCSF Parnassus",
    "Golden Gate Park",
    "Crissy Field",
    "The Battery",
    "Salesforce Tower",
  ],
  "Los Angeles": [
    "The Beverly Hilton",
    "Hollywood Bowl",
    "Santa Monica Pier",
    "Venice Beach",
    "Griffith Observatory",
    "Downtown LA Arts District",
    "Melrose Avenue",
    "The Standard",
    "Sunset Strip",
    "Manhattan Beach",
  ],
  Chicago: [
    "Navy Pier",
    "Millennium Park",
    "Chicago Theatre",
    "Lincoln Park Zoo",
    "Art Institute",
    "Willis Tower",
    "Grant Park",
    "Wicker Park",
    "River North",
    "The Loop",
  ],
  Boston: [
    "Faneuil Hall",
    "Boston Convention Center",
    "Harvard University",
    "MIT Campus",
    "Back Bay",
    "North End",
    "Seaport District",
    "Cambridge Innovation Center",
    "Boston Common",
    "Fenway Park",
  ],
  "Washington DC": [
    "Kennedy Center",
    "Smithsonian",
    "Georgetown",
    "Capitol Hill",
    "Dupont Circle",
    "Adams Morgan",
    "The Wharf",
    "National Gallery",
    "Union Station",
    "Penn Quarter",
  ],
  Seattle: [
    "Pike Place Market",
    "Space Needle",
    "Amazon Spheres",
    "Capitol Hill",
    "Fremont",
    "Ballard",
    "South Lake Union",
    "Pioneer Square",
    "Queen Anne",
    "University District",
  ],
  Austin: [
    "Austin Convention Center",
    "South by Southwest",
    "Lady Bird Lake",
    "Downtown Austin",
    "East Austin",
    "Rainey Street",
    "The Domain",
    "UT Campus",
    "Zilker Park",
    "Music Lane",
  ],
  Miami: [
    "South Beach",
    "Wynwood",
    "Brickell",
    "Design District",
    "Coconut Grove",
    "Little Havana",
    "Miami Beach Convention Center",
    "Art Deco District",
    "Coral Gables",
    "Key Biscayne",
  ],
  Denver: [
    "Denver Convention Center",
    "RiNo District",
    "LoDo",
    "Cherry Creek",
    "Capitol Hill",
    "Highlands",
    "Union Station",
    "Red Rocks",
    "Washington Park",
    "Five Points",
  ],
  "Las Vegas": [
    "Las Vegas Convention Center",
    "The Strip",
    "Downtown Las Vegas",
    "Red Rock Canyon",
    "Arts District",
    "Fremont Street",
    "Summerlin",
    "Henderson",
    "Lake Las Vegas",
    "Container Park",
  ],
  Philadelphia: [
    "Pennsylvania Convention Center",
    "Independence Hall",
    "Rittenhouse Square",
    "Northern Liberties",
    "Fishtown",
    "University City",
    "Old City",
    "Society Hill",
    "Center City",
    "South Street",
  ],
  Phoenix: [
    "Phoenix Convention Center",
    "Downtown Phoenix",
    "Scottsdale",
    "Tempe",
    "Old Town Scottsdale",
    "Desert Botanical Garden",
    "Papago Park",
    "Camelback Mountain",
    "Roosevelt Row",
    "Mill Avenue",
  ],
  "San Diego": [
    "San Diego Convention Center",
    "Gaslamp Quarter",
    "Balboa Park",
    "La Jolla",
    "Mission Beach",
    "Little Italy",
    "Hillcrest",
    "Pacific Beach",
    "Coronado",
    "Sunset Cliffs",
  ],
  Portland: [
    "Oregon Convention Center",
    "Pearl District",
    "Hawthorne",
    "Alberta Arts District",
    "Powell's Books",
    "Pioneer Courthouse Square",
    "Forest Park",
    "Mount Hood",
    "Burnside",
    "Division",
  ],
  "Salt Lake City": [
    "Salt Palace Convention Center",
    "Downtown Salt Lake",
    "The Gateway",
    "Sugar House",
    "Capitol Hill",
    "Avenues",
    "Liberty Park",
    "Temple Square",
    "University of Utah",
    "Trolley Square",
  ],
  Atlanta: [
    "Georgia World Congress Center",
    "Midtown Atlanta",
    "Buckhead",
    "Virginia-Highland",
    "Little Five Points",
    "Poncey-Highland",
    "Inman Park",
    "Olympic Park",
    "Atlantic Station",
    "Piedmont Park",
  ],
  Dallas: [
    "Kay Bailey Hutchison Convention Center",
    "Deep Ellum",
    "Uptown Dallas",
    "Bishop Arts District",
    "Knox-Henderson",
    "Lower Greenville",
    "Victory Park",
    "Trinity Groves",
    "Design District",
    "Addison",
  ],
  Houston: [
    "George R. Brown Convention Center",
    "Downtown Houston",
    "The Heights",
    "Montrose",
    "Rice Village",
    "Museum District",
    "Galleria",
    "Midtown",
    "East End",
    "River Oaks",
  ],
  Toronto: [
    "Metro Toronto Convention Centre",
    "King Street West",
    "Queen Street West",
    "Distillery District",
    "Liberty Village",
    "Yorkville",
    "Entertainment District",
    "Financial District",
    "Kensington Market",
    "The Beaches",
  ],
  Vancouver: [
    "Vancouver Convention Centre",
    "Gastown",
    "Yaletown",
    "Granville Island",
    "Kitsilano",
    "Commercial Drive",
    "Main Street",
    "Mount Pleasant",
    "Olympic Village",
    "Coal Harbour",
  ],
  Montreal: [
    "Palais des congrès",
    "Old Montreal",
    "Plateau Mont-Royal",
    "Mile End",
    "Little Italy",
    "Gay Village",
    "Downtown Montreal",
    "Quartier des Spectacles",
    "Saint-Laurent",
    "Griffintown",
  ],
  Calgary: [
    "TELUS Convention Centre",
    "Stephen Avenue",
    "Kensington",
    "Inglewood",
    "Mission",
    "Hillhurst",
    "East Village",
    "Beltline",
    "Eau Claire",
    "Prince's Island",
  ],
  Waterloo: [
    "Waterloo Region Museum",
    "University of Waterloo",
    "Wilfrid Laurier University",
    "Uptown Waterloo",
    "Kitchener-Waterloo",
    "Grand River",
    "Victoria Park",
    "Iron Horse Trail",
    "RIM Park",
    "St. Jacobs",
  ],
  "Mexico City": [
    "Centro Citibanamex",
    "Polanco",
    "Roma Norte",
    "Condesa",
    "Coyoacán",
    "San Ángel",
    "Xochimilco",
    "Centro Histórico",
    "Zona Rosa",
    "Santa Fe",
  ],
  Honolulu: [
    "Hawaii Convention Center",
    "Waikiki",
    "Downtown Honolulu",
    "Chinatown",
    "Kalihi",
    "Manoa",
    "Diamond Head",
    "Ala Moana",
    "Kahala",
    "Pearl Harbor",
  ],
  London: [
    "ExCeL London",
    "The Shard",
    "Queen Elizabeth Hall",
    "Camden Market",
    "Shoreditch",
    "Canary Wharf",
    "Kings Cross",
    "Tate Modern",
    "The Barbican",
    "Somerset House",
  ],
  Paris: [
    "Palais des Congrès",
    "Le Marais",
    "Saint-Germain",
    "Montmartre",
    "Latin Quarter",
    "Champs-Élysées",
    "Bastille",
    "République",
    "Invalides",
    "Opéra",
  ],
  Berlin: [
    "Messe Berlin",
    "Berghain",
    "Kreuzberg",
    "Mitte",
    "Potsdamer Platz",
    "East Side Gallery",
    "Friedrichshain",
    "Prenzlauer Berg",
    "Charlottenburg",
    "Hackescher Markt",
  ],
  Amsterdam: [
    "RAI Amsterdam",
    "Jordaan",
    "De Pijp",
    "Vondelpark",
    "Red Light District",
    "Museumplein",
    "Leidseplein",
    "NDSM Wharf",
    "Plantage",
    "Oosterdok",
  ],
  Barcelona: [
    "Fira Barcelona",
    "Gothic Quarter",
    "El Born",
    "Gràcia",
    "Eixample",
    "Barceloneta",
    "Park Güell",
    "Sagrada Família",
    "Las Ramblas",
    "Poble Nou",
  ],
  Madrid: [
    "IFEMA",
    "Malasaña",
    "Chueca",
    "La Latina",
    "Retiro",
    "Salamanca",
    "Lavapiés",
    "Chamberí",
    "Gran Vía",
    "Plaza Mayor",
  ],
  Milan: [
    "Fiera Milano",
    "Navigli",
    "Brera",
    "Porta Nuova",
    "Isola",
    "Porta Ticinese",
    "Quadrilatero della Moda",
    "Città Studi",
    "Lambrate",
    "Garibaldi",
  ],
  Stockholm: [
    "Stockholm Waterfront",
    "Gamla Stan",
    "Södermalm",
    "Östermalm",
    "Norrmalm",
    "Vasastan",
    "Djurgården",
    "Hammarby Sjöstad",
    "Hornstull",
    "Stureplan",
  ],
  Copenhagen: [
    "Bella Center",
    "Nyhavn",
    "Vesterbro",
    "Nørrebro",
    "Østerbro",
    "Frederiksberg",
    "Islands Brygge",
    "Refshaleøen",
    "Carlsberg City",
    "Amager",
  ],
  Dublin: [
    "Convention Centre Dublin",
    "Temple Bar",
    "Trinity College",
    "Grafton Street",
    "Temple Bar",
    "Docklands",
    "Ballsbridge",
    "St. Stephen's Green",
    "Phoenix Park",
    "Smithfield",
  ],
  Helsinki: [
    "Helsinki Exhibition Centre",
    "Design District",
    "Punavuori",
    "Kamppi",
    "Kallio",
    "Kruununhaka",
    "Suomenlinna",
    "Market Square",
    "Senate Square",
    "Esplanadi",
  ],
  Brussels: [
    "Brussels Expo",
    "Grand Place",
    "Sablon",
    "Ixelles",
    "Uccle",
    "Saint-Gilles",
    "Etterbeek",
    "European Quarter",
    "Atomium",
    "Royal Museums",
  ],
  Zurich: [
    "Messe Zürich",
    "Old Town",
    "Kreis 5",
    "Wiedikon",
    "Seefeld",
    "Niederdorf",
    "Bahnhofstrasse",
    "Lake Zurich",
    "ETH Zurich",
    "University of Zurich",
  ],
  Geneva: [
    "Palexpo",
    "Old Town",
    "Pâquis",
    "Plainpalais",
    "Eaux-Vives",
    "Carouge",
    "Champel",
    "Lake Geneva",
    "United Nations",
    "CERN",
  ],
  Lausanne: [
    "Beaulieu Convention Centre",
    "Ouchy",
    "Flon",
    "Old Town",
    "Malley",
    "Renens",
    "EPFL",
    "University of Lausanne",
    "Lake Geneva",
    "Olympic Museum",
  ],
  Munich: [
    "Messe München",
    "Marienplatz",
    "Schwabing",
    "Glockenbachviertel",
    "Maxvorstadt",
    "Lehel",
    "Haidhausen",
    "Neuhausen",
    "English Garden",
    "BMW Welt",
  ],
  Prague: [
    "PVA Expo Prague",
    "Old Town",
    "New Town",
    "Lesser Town",
    "Vinohrady",
    "Žižkov",
    "Karlín",
    "Smíchov",
    "Vršovice",
    "Dejvice",
  ],
  Lisbon: [
    "FIL",
    "Alfama",
    "Bairro Alto",
    "Chiado",
    "Príncipe Real",
    "Santos",
    "Cais do Sodré",
    "LX Factory",
    "Belém",
    "Parque das Nações",
  ],
  Istanbul: [
    "Istanbul Convention Center",
    "Sultanahmet",
    "Beyoğlu",
    "Kadıköy",
    "Beşiktaş",
    "Şişli",
    "Galata",
    "Karaköy",
    "Nişantaşı",
    "Ortaköy",
  ],
  "Tel Aviv": [
    "Tel Aviv Convention Center",
    "Neve Tzedek",
    "Florentin",
    "Jaffa",
    "Rothschild Boulevard",
    "Sarona",
    "Port of Tel Aviv",
    "Carmel Market",
    "Dizengoff",
    "Ramat Aviv",
  ],
  Tokyo: [
    "Tokyo Big Sight",
    "Shibuya",
    "Harajuku",
    "Ginza",
    "Roppongi",
    "Akihabara",
    "Shinjuku",
    "Asakusa",
    "Ikebukuro",
    "Odaiba",
  ],
  Singapore: [
    "Suntec Singapore",
    "Marina Bay Sands",
    "Gardens by the Bay",
    "Clarke Quay",
    "Sentosa Island",
    "Orchard Road",
    "Chinatown",
    "Little India",
    "Bugis",
    "Raffles Place",
  ],
  "Hong Kong": [
    "AsiaWorld-Expo",
    "Central",
    "Tsim Sha Tsui",
    "Causeway Bay",
    "Wan Chai",
    "Mong Kok",
    "Admiralty",
    "Soho",
    "Lan Kwai Fong",
    "Victoria Peak",
  ],
  Seoul: [
    "COEX",
    "Gangnam",
    "Hongdae",
    "Itaewon",
    "Myeongdong",
    "Insadong",
    "Jongno",
    "Sinchon",
    "Apgujeong",
    "Dongdaemun",
  ],
  Sydney: [
    "ICC Sydney",
    "The Rocks",
    "Circular Quay",
    "Darling Harbour",
    "Surry Hills",
    "Newtown",
    "Bondi",
    "Manly",
    "Paddington",
    "Chippendale",
  ],
  Melbourne: [
    "Melbourne Convention Centre",
    "CBD",
    "Fitzroy",
    "Collingwood",
    "Richmond",
    "South Yarra",
    "St Kilda",
    "Carlton",
    "Southbank",
    "Docklands",
  ],
  Mumbai: [
    "NESCO",
    "BKC",
    "Nariman Point",
    "Powai",
    "Andheri",
    "Bandra",
    "Lower Parel",
    "Worli",
    "Colaba",
    "Juhu",
  ],
  Bangalore: [
    "BIEC",
    "Koramangala",
    "Indiranagar",
    "Whitefield",
    "Electronic City",
    "HSR Layout",
    "JP Nagar",
    "Malleshwaram",
    "Jayanagar",
    "MG Road",
  ],
  "New Delhi": [
    "Pragati Maidan",
    "Connaught Place",
    "Khan Market",
    "Hauz Khas",
    "Lajpat Nagar",
    "Karol Bagh",
    "Greater Kailash",
    "Defence Colony",
    "Vasant Vihar",
    "Nehru Place",
  ],
  Bangkok: [
    "QSNCC",
    "Sukhumvit",
    "Silom",
    "Siam",
    "Chatuchak",
    "Khao San Road",
    "Thonglor",
    "Ekkamai",
    "Ari",
    "Sathorn",
  ],
  Jakarta: [
    "JCC",
    "SCBD",
    "Menteng",
    "Kemang",
    "Senayan",
    "Kelapa Gading",
    "PIK",
    "Pondok Indah",
    "Kuningan",
    "Thamrin",
  ],
  "Kuala Lumpur": [
    "KLCC",
    "Bukit Bintang",
    "TREC",
    "Mont Kiara",
    "Bangsar",
    "Damansara",
    "Ampang",
    "Chow Kit",
    "Chinatown",
    "Little India",
  ],
  Manila: [
    "SMX Convention Center",
    "Makati",
    "BGC",
    "Ortigas",
    "Quezon City",
    "Ermita",
    "Malate",
    "Intramuros",
    "Alabang",
    "Eastwood",
  ],
  "Ho Chi Minh City": [
    "SECC",
    "District 1",
    "District 3",
    "District 7",
    "Thao Dien",
    "Ben Thanh",
    "Nguyen Hue",
    "Dong Khoi",
    "Pham Ngu Lao",
    "Binh Thanh",
  ],
  Taipei: [
    "Taipei Nangang Exhibition Center",
    "Xinyi",
    "Da'an",
    "Zhongshan",
    "Shilin",
    "Beitou",
    "Ximending",
    "Songshan",
    "Banqiao",
    "Tamsui",
  ],
  Dubai: [
    "Dubai World Trade Centre",
    "Downtown Dubai",
    "Dubai Marina",
    "JBR",
    "DIFC",
    "Business Bay",
    "Jumeirah",
    "Deira",
    "Bur Dubai",
    "Dubai Hills",
  ],
  "São Paulo": [
    "Expo Center Norte",
    "Vila Madalena",
    "Itaim Bibi",
    "Jardins",
    "Vila Olímpia",
    "Pinheiros",
    "Moema",
    "Brooklin",
    "Higienópolis",
    "Centro",
  ],
  "Rio de Janeiro": [
    "Riocentro",
    "Copacabana",
    "Ipanema",
    "Leblon",
    "Barra da Tijuca",
    "Santa Teresa",
    "Lapa",
    "Botafogo",
    "Flamengo",
    "Tijuca",
  ],
  "Buenos Aires": [
    "La Rural",
    "Palermo",
    "Recoleta",
    "San Telmo",
    "Puerto Madero",
    "Belgrano",
    "Villa Crespo",
    "Barracas",
    "Caballito",
    "Núñez",
  ],
  Bogotá: [
    "Corferias",
    "Zona Rosa",
    "La Candelaria",
    "Chapinero",
    "Zona T",
    "Usaquén",
    "La Macarena",
    "Andino",
    "Centro Internacional",
    "Salitre",
  ],
  Medellín: [
    "Plaza Mayor",
    "El Poblado",
    "Laureles",
    "Envigado",
    "Sabaneta",
    "La Candelaria",
    "Centro",
    "Estadio",
    "Belén",
    "Itagüí",
  ],
  Lagos: [
    "Landmark Centre",
    "Victoria Island",
    "Ikoyi",
    "Lekki",
    "Ikeja",
    "Surulere",
    "Yaba",
    "Maryland",
    "Gbagada",
    "Apapa",
  ],
  Nairobi: [
    "Sarit Centre",
    "Westlands",
    "Karen",
    "Kilimani",
    "Lavington",
    "Parklands",
    "Gigiri",
    "Runda",
    "Spring Valley",
    "Muthaiga",
  ],
};

// --- ROBUST LLM HELPER FUNCTIONS --------------------------
function extractFirstJSONObject(text: string): any {
  try {
    // First try direct parse
    return JSON.parse(text);
  } catch {
    // Look for JSON object in markdown fences or mixed content
    const jsonMatches =
      text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
      text.match(/(\{[\s\S]*\})/);

    if (jsonMatches) {
      try {
        return JSON.parse(jsonMatches[1]);
      } catch {
        // fallback
      }
    }
    throw new Error("No valid JSON found in response");
  }
}

async function callLLMWithRetry(
  prompt: string,
  maxTokens = 4000,
  maxAttempts = 3
): Promise<string> {
  if (!USE_LLM) {
    throw new Error("LLM disabled via USE_LLM=false");
  }

  if (LLM_API_KEY === "your-api-key-here") {
    throw new Error("LLM_API_KEY not set");
  }

  // Ensure log directory exists
  const logDir = "./.local/seed-logs";
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }


  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a JSON generator. Return ONLY valid JSON with no markdown, explanations, or other text.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
          temperature: 0.3,
          // Note: Together.ai may not support response_format, but it doesn't hurt
          response_format: { type: "json_object" },
        }),
      });
      console.log(response);

      if (!response.ok) {
        if (response.status === 429) {
          const backoffMs =
            Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000;
          console.warn(
            `Rate limited, backing off ${backoffMs}ms (attempt ${attempt}/${maxAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from LLM");
      }

      // Log raw response for debugging
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      writeFileSync(
        `${logDir}/llm-response-${timestamp}-attempt-${attempt}.json`,
        JSON.stringify(
          { prompt: prompt.slice(0, 200), response: content },
          null,
          2
        )
      );

      // Robust JSON extraction
      const parsed = extractFirstJSONObject(content);
      return JSON.stringify(parsed); // Re-stringify to ensure clean JSON
    } catch (error) {
      console.warn(
        `LLM attempt ${attempt}/${maxAttempts} failed:`,
        error.message
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const backoffMs = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

async function callLLM(prompt: string, maxTokens = 4000): Promise<string> {
  return callLLMWithRetry(prompt, maxTokens, 3);
}

// --- REALISTIC SCHEDULING HELPERS -------------------------
function getRealisticEventTime(location: any): { start: Date; end: Date } {
  const now = new Date();
  const daysAhead = faker.number.int({ min: 7, max: 120 });
  const targetDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // Bias toward Thu-Fri evenings, Sat mornings/afternoons
  const dayOfWeek = targetDate.getDay();
  let hour: number;

  if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    // Mon-Wed: less common
    if (Math.random() < 0.3) {
      hour = faker.number.int({ min: 18, max: 20 }); // Evening events
    } else {
      hour = faker.number.int({ min: 9, max: 17 }); // Day events
    }
  } else if (dayOfWeek === 4 || dayOfWeek === 5) {
    // Thu-Fri: popular evenings
    hour =
      Math.random() < 0.7
        ? faker.number.int({ min: 18, max: 20 }) // Evening bias
        : faker.number.int({ min: 14, max: 17 });
  } else if (dayOfWeek === 6) {
    // Saturday: workshops and conferences
    hour =
      Math.random() < 0.6
        ? faker.number.int({ min: 10, max: 14 }) // Morning/afternoon
        : faker.number.int({ min: 15, max: 18 });
  } else {
    // Sunday: casual/community
    hour = faker.number.int({ min: 14, max: 17 });
  }

  const start = new Date(targetDate);
  start.setHours(hour, faker.number.int({ min: 0, max: 45 }), 0, 0);

  const duration = faker.number.int({ min: 1, max: 4 });
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  return { start, end };
}

function getRealisticVenue(
  location: any,
  locationType: LocationType
): { venueName: string | null; venueAddress: string | null } {
  if (locationType === LocationType.ONLINE) {
    return { venueName: null, venueAddress: null };
  }

  const cityVenues = VENUES_BY_CITY[location?.name] || [];
  const venueName = cityVenues.length
    ? faker.helpers.arrayElement(cityVenues)
    : `${location?.name || "Downtown"} Convention Center`;

  const venueAddress = faker.location.streetAddress();

  return { venueName, venueAddress };
}

// --- ENHANCED GENERATORS -----------------------------------
async function generateCommunityEcosystems(
  locations: any[],
  batchSize = 10
): Promise<any[]> {
  if (!USE_LLM) {
    console.log("🔄 LLM disabled, using faker fallback for communities");
    return Array.from({ length: NUM_COMMUNITIES }, () => ({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      focusArea: "Technology",
      targetAudience: "Professionals",
      membershipStyle: "open",
      membershipTiers: [],
      eventTypes: ["networking", "workshop"],
      categories: ["Technology", "Networking"],
      events: [],
      homeLocationId: faker.helpers.arrayElement(locations).id,
    }));
  }

  const batches = Math.ceil(NUM_COMMUNITIES / batchSize);
  const allCommunities: any[] = [];

  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, NUM_COMMUNITIES);
    const communitiesInBatch = batchEnd - batchStart;

    console.log(
      `🤖 Generating community batch ${
        batch + 1
      }/${batches} (${communitiesInBatch} communities)...`
    );

    // Use all locations for better distribution
    const locationNames = locations.map((l) => l.name);

    const prompt = `
Generate exactly ${communitiesInBatch} realistic professional communities.

Available locations: ${locationNames.join(", ")}

Return this exact JSON structure:
{
  "communities": [
    {
      "name": "Community name",
      "description": "2-3 sentence description",
      "focusArea": "Technology|Design|Finance|Health|Education|Creative|Business",
      "targetAudience": "Specific audience like Software Engineers or Marketing Professionals",
      "membershipStyle": "open|invite-only|application-based",
      "homeLocation": "Pick ONE location from the list above",
      "membershipTiers": [
        {
          "name": "Basic|Pro|Premium|VIP",
          "description": "Benefits description",
          "priceCents": 1500,
          "benefits": ["benefit1", "benefit2"]
        }
      ],
      "eventTypes": ["workshop", "networking", "conference", "panel"],
      "categories": ["relevant", "category", "tags"],
      "events": [
        {
          "title": "Specific event title",
          "subtitle": "One-line description",
          "description": "Clear 2-3 sentence description",
          "eventType": "workshop|networking|conference|panel|demo|social",
          "targetCapacity": 80,
          "isPaid": true,
          "ticketTiers": [
            {
              "name": "Early Bird|Regular|VIP",
              "description": "What's included",
              "priceCents": 2500,
              "capacity": 40
            }
          ],
          "promoCodes": [
            {
              "code": "EARLY20",
              "description": "Early bird discount",
              "discountPercent": 20
            }
          ]
        }
      ]
    }
  ]
}

Requirements:
- Distribute across different locations evenly
- Mix free and paid events/memberships
- Realistic pricing: events $0-200, memberships $5-50/month
- Each community should feel unique and professional`;

    try {
      const response = await callLLM(prompt, 6000);
      const batchData = extractFirstJSONObject(response);

      if (!batchData.communities || !Array.isArray(batchData.communities)) {
        throw new Error("Invalid response structure");
      }

      // Map home location names to IDs
      const processedCommunities = batchData.communities.map((c: any) => {
        const homeLocation = locations.find((l) => l.name === c.homeLocation);
        return {
          ...c,
          homeLocationId:
            homeLocation?.id || faker.helpers.arrayElement(locations).id,
        };
      });

      allCommunities.push(...processedCommunities);
    } catch (error) {
      console.warn(
        `Batch ${batch + 1} failed, falling back to faker data:`,
        error
      );
      // Fallback to faker for this batch
      for (let i = 0; i < communitiesInBatch; i++) {
        allCommunities.push({
          name: faker.company.name(),
          description: faker.lorem.paragraph(),
          focusArea: "Technology",
          targetAudience: "Professionals",
          membershipStyle: "open",
          membershipTiers: [],
          eventTypes: ["networking", "workshop"],
          categories: ["Technology", "Networking"],
          events: [],
          homeLocationId: faker.helpers.arrayElement(locations).id,
        });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`✅ Generated ${allCommunities.length} communities`);
  return allCommunities;
}

async function generateUserPersonas(
  count: number,
  locations: any[]
): Promise<any[]> {
  if (!USE_LLM) {
    console.log("🔄 LLM disabled, using faker fallback for users");
    return Array.from({ length: count }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      profession: faker.person.jobTitle(),
      industry: "Technology",
      experienceLevel: "mid",
      interests: ["Technology", "Networking"],
      location: faker.helpers.arrayElement(locations).name,
      networkingStyle: "active",
      spendingPower: "medium",
      bio: faker.lorem.sentence(),
    }));
  }

  const batches = Math.ceil(count / 50); // 50 users per batch
  const allUsers: any[] = [];

  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * 50;
    const batchEnd = Math.min(batchStart + 50, count);
    const usersInBatch = batchEnd - batchStart;

    console.log(
      `🤖 Generating user batch ${
        batch + 1
      }/${batches} (${usersInBatch} users)...`
    );

    const locationSample = faker.helpers.arrayElements(locations, 10);
    const locationNames = locationSample.map((l) => l.name);

    const prompt = `
Generate ${usersInBatch} realistic professional personas for an event platform.

LOCATIONS: ${locationNames.join(", ")}

Return this JSON structure:
{
  "users": [
    {
      "firstName": "First name",
      "lastName": "Last name", 
      "profession": "Specific job title",
      "industry": "Industry sector",
      "experienceLevel": "junior|mid|senior|executive",
      "interests": ["3-4 professional/personal interests"],
      "location": "One location from the list above",
      "networkingStyle": "active|selective|casual",
      "spendingPower": "low|medium|high",
      "bio": "1-2 sentence professional bio"
    }
  ]
}

Create diverse professionals across:
- Tech (engineers, designers, PMs, data scientists)
- Business (marketing, sales, consulting, finance)
- Creative (design, content, media)
- Healthcare, education, legal, etc.

Make each person feel authentic with realistic combinations of job titles, experience levels, and interests.

Return ONLY valid JSON.`;

try {
  const response = await callLLM(prompt, 4000);
      const batchData = extractFirstJSONObject(response);
      allUsers.push(...batchData.users);
    } catch (error) {
      console.warn(`User batch ${batch + 1} failed, using faker fallback`);
      // Faker fallback
      for (let i = 0; i < usersInBatch; i++) {
        allUsers.push({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          profession: faker.person.jobTitle(),
          industry: "Technology",
          experienceLevel: "mid",
          interests: ["Technology", "Networking"],
          location: faker.helpers.arrayElement(locationNames),
          networkingStyle: "active",
          spendingPower: "medium",
          bio: faker.lorem.sentence(),
        });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`✅ Generated ${allUsers.length} user personas`);
  return allUsers;
}

async function generateRealisticFeedback(
  events: any[],
  users: any[]
): Promise<any[]> {
  const feedbackSample = faker.helpers.arrayElements(
    events,
    Math.min(20, events.length)
  );

  const eventDescriptions = feedbackSample
    .map((e) => `"${e.title}" - ${e.eventType || "networking"} event`)
    .join("\n");

  const prompt = `
Generate realistic feedback comments for these events:
${eventDescriptions}

Return JSON:
{
  "feedbackTemplates": [
    {
      "eventType": "workshop|networking|conference|panel",
      "rating": 4,
      "comments": ["Realistic feedback comment 1", "comment 2", "comment 3"]
    }
  ]
}

Make feedback sound authentic - mix of constructive criticism, praise, and specific observations.
Vary the tone from professional to casual.
Include both positive (4-5 star) and critical (2-3 star) feedback.

Return ONLY valid JSON.`;

  try {
    const response = await callLLM(prompt, 2000);
    const data = extractFirstJSONObject(response);
    return data.feedbackTemplates;
  } catch (error) {
    console.warn("Feedback generation failed, using faker fallback");
    return [];
  }
}

// --- UTILITY FUNCTIONS (SINGLE DEFINITION) ----------------
const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const sampleSize = <T>(arr: T[], n: number) =>
  faker.helpers.arrayElements(arr, Math.min(n, arr.length));
const slug = (s: string) =>
  slugify(s, { lower: true, strict: true }).substring(0, 48) ||
  faker.string.alphanumeric(8);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function randomDateWithinRange({
  startDaysAgo = 120,
  endDaysAhead = 120,
} = {}) {
  const now = new Date();
  const from = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const to = new Date(now.getTime() + endDaysAhead * 24 * 60 * 60 * 1000);
  return faker.date.between({ from, to });
}

function addHours(date: Date, hours = 2) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// Add missing uniqueSlug utility
const usedSlugs = new Set<string>();
function uniqueSlug(base: string): string {
  let s = slug(base);
  let counter = 2;
  while (usedSlugs.has(s)) {
    s = `${slug(base)}-${counter}`;
    counter++;
  }
  // In append mode, sprinkle a tiny suffix to avoid colliding with past runs
  if (SEED_MODE === "append") {
    s = `${s}-${faker.string.alphanumeric(3).toLowerCase()}`;
  }
  usedSlugs.add(s);
  return s;
}

// Enhanced scheduling with community cadence
function getCommunityEventCadence() {
  return {
    frequency: rand(["monthly", "biweekly", "weekly"]),
    dayOfWeek: faker.helpers.weightedArrayElement([
      { weight: 5, value: 1 }, // Monday
      { weight: 10, value: 2 }, // Tuesday
      { weight: 15, value: 3 }, // Wednesday
      { weight: 25, value: 4 }, // Thursday (popular)
      { weight: 20, value: 5 }, // Friday
      { weight: 20, value: 6 }, // Saturday
      { weight: 5, value: 0 }, // Sunday
    ]),
    hour: faker.helpers.weightedArrayElement([
      { weight: 10, value: faker.number.int({ min: 9, max: 11 }) }, // Morning
      { weight: 15, value: faker.number.int({ min: 14, max: 16 }) }, // Afternoon
      { weight: 25, value: faker.number.int({ min: 18, max: 20 }) }, // Evening (popular)
    ]),
  };
}

function getEventDateWithCadence(
  cadence: any,
  location: any,
  isPast: boolean
): { start: Date; end: Date; createdAt: Date; publishedAt: Date | null } {
  const now = new Date();
  const baseDate = isPast
    ? new Date(
        now.getTime() -
          faker.number.int({ min: 7, max: 180 }) * 24 * 60 * 60 * 1000
      )
    : new Date(
        now.getTime() +
          faker.number.int({ min: 7, max: 120 }) * 24 * 60 * 60 * 1000
      );

  // Align to community's preferred day/hour with small jitter
  const targetDay = cadence.dayOfWeek;
  const currentDay = baseDate.getDay();
  const dayDiff = (targetDay - currentDay + 7) % 7;

  const alignedDate = new Date(
    baseDate.getTime() + dayDiff * 24 * 60 * 60 * 1000
  );
  alignedDate.setHours(
    cadence.hour + faker.number.int({ min: -1, max: 1 }), // Small hour jitter
    faker.number.int({ min: 0, max: 45 }), // Random minutes
    0,
    0
  );

  const duration = faker.number.int({ min: 1, max: 4 });
  const start = alignedDate;
  const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

  // Realistic creation/publish timeline
  const createdAt = new Date(
    start.getTime() -
      faker.number.int({ min: 14, max: 60 }) * 24 * 60 * 60 * 1000
  );
  const publishedAt =
    Math.random() < 0.85
      ? new Date(
          createdAt.getTime() +
            faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000
        )
      : null;

  return { start, end, createdAt, publishedAt };
}

// Enhanced LLM call for title/description top-ups
async function generateEventTopUps(
  count: number,
  communityName?: string
): Promise<any[]> {
  if (!USE_LLM || count === 0) {
    return Array.from({ length: count }, () => ({
      title: faker.company.catchPhrase(),
      subtitle: faker.company.buzzPhrase(),
      description: faker.lorem.paragraphs(2),
    }));
  }

  const context = communityName
    ? `for the "${communityName}" community`
    : "for professional events";

  const prompt = `
Generate ${count} realistic event titles and descriptions ${context}.

Return JSON:
{
  "events": [
    {
      "title": "Specific, engaging event title",
      "subtitle": "One-line description that hooks attendees", 
      "description": "2-3 sentence description that explains value and format"
    }
  ]
}

Make titles specific and actionable (not generic "conference" or "workshop" labels).
Examples of good titles:
- "Building React Components That Scale: Lessons from Airbnb"
- "Customer Retention Strategies for SaaS: Data-Driven Approaches"
- "AI Ethics in Healthcare: Panel with Stanford Researchers"

Return ONLY valid JSON.`;

  try {
    const response = await callLLM(prompt, 1500);
    const data = extractFirstJSONObject(response);
    return data.events || [];
  } catch (error) {
    console.warn(
      "Event top-up generation failed, using improved faker fallback"
    );
    // Better faker fallback - avoid generic buzzwords
    return Array.from({ length: count }, () => {
      const action = faker.helpers.arrayElement([
        "Building",
        "Mastering",
        "Understanding",
        "Exploring",
        "Implementing",
      ]);
      const topic = faker.helpers.arrayElement([
        "Data Science",
        "Product Strategy",
        "Design Systems",
        "Team Leadership",
        "Market Research",
      ]);
      const angle = faker.helpers.arrayElement([
        "Best Practices",
        "Case Studies",
        "Hands-on Workshop",
        "Expert Panel",
      ]);

      return {
        title: `${action} ${topic}: ${angle}`,
        subtitle: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
      };
    });
  }
}

// Enhanced RSVP generation that derives from views
function generateRSVPsFromViews(
  viewCount: number,
  eventType: string,
  isPaid: boolean
): { rsvpTarget: number; conversionRate: number } {
  // Different conversion rates by event type and payment
  const baseRates = {
    networking: { free: 0.25, paid: 0.12 },
    workshop: { free: 0.35, paid: 0.18 },
    conference: { free: 0.2, paid: 0.15 },
    panel: { free: 0.3, paid: 0.14 },
    demo: { free: 0.4, paid: 0.2 },
    social: { free: 0.45, paid: 0.16 },
  };

  const rates = baseRates[eventType] || baseRates["networking"];
  const baseRate = isPaid ? rates.paid : rates.free;

  // Add some variance with Beta distribution feel
  const variance = faker.number.float({ min: 0.7, max: 1.3 });
  const conversionRate = Math.min(0.6, baseRate * variance); // Cap at 60%

  const rsvpTarget = Math.floor(viewCount * conversionRate);

  return { rsvpTarget, conversionRate };
}

// --- REALISTIC CREATORS -----------------------------------

// Enhanced createUsers with better probability handling
async function createUsers(count: number, locations: any[]) {
  console.log(`🤖 Generating realistic user personas...`);
  const userPersonas = await generateUserPersonas(count, locations);

  const testCredentials: {
    email: string;
    password: string;
    name: string;
    id?: string;
  }[] = [];
  const data = [];

  console.log(`Creating ${count} users with enhanced personas...`);

  for (let i = 0; i < count; i++) {
    const persona = userPersonas[i] || {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      profession: faker.person.jobTitle(),
      location: faker.helpers.arrayElement(locations).name,
    };
    // Make emails globally unique across runs
    const name = `${persona.firstName} ${persona.lastName}`;
    const email = `${faker.internet.userName().toLowerCase()}+${faker.string
      .alphanumeric(6)
      .toLowerCase()}@${faker.internet.domainName().toLowerCase()}`;
    const plainPassword = faker.internet.password({ length: 12 });
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Find location ID
    const userLocation = locations.find((l) => l.name === persona.location);

    testCredentials.push({ email, password: plainPassword, name });

    data.push({
      name,
      email,
      image: getAvatarURL(name),
      password: hashedPassword,
      emailVerified: Math.random() < 0.7 ? faker.date.past() : null, // Fixed probability
      locationId: userLocation?.id || null,
    });

    if ((i + 1) % 50 === 0) {
      console.log(`  Enhanced ${i + 1}/${count} users...`);
    }
  }

  const users =
    "createManyAndReturn" in prisma.user
      ? await (prisma.user as any).createManyAndReturn({ data })
      : await prisma.$transaction(
          data.map((u) => prisma.user.create({ data: u }))
        );

  users.forEach((user: any, index: number) => {
    testCredentials[index].id = user.id;
    // Attach persona data for later use
    user.persona = userPersonas[index] || {};
  });

  // Create .local directory and secure the file
  const testDir = "./.local";
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }

  const testAccountsPath = `${testDir}/test-accounts.json`;
  writeFileSync(
    testAccountsPath,
    JSON.stringify(testCredentials, null, 2),
    "utf-8"
  );
  console.log(
    `✅ ${users.length} users created. Test accounts saved to .local/test-accounts.json`
  );

  return users;
}

// Enhanced createCommunities with capped host pools and cadence
async function createCommunities(
  users: any[],
  images: any[],
  locations: any[]
) {
  console.log(`🤖 Generating realistic community ecosystems...`);
  const communityEcosystems = await generateCommunityEcosystems(locations);

  const ownerPool = sampleSize(users, Math.ceil(NUM_COMMUNITIES * 0.8));
  const data = [];

  for (let i = 0; i < NUM_COMMUNITIES; i++) {
    const owner = rand(ownerPool);
    const ecosystem = communityEcosystems[i] || {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      membershipTiers: [],
    };

    // Capped host pool: owner + max 30 other users
    const hostPool = [
      owner,
      ...sampleSize(
        users.filter((u) => u.id !== owner.id),
        30
      ),
    ];

    // Assign stable cadence to community
    const cadence = getCommunityEventCadence();

    data.push({
      name: ecosystem.name,
      slug: uniqueSlug(ecosystem.name),
      description: ecosystem.description,
      coverImage: rand(images),
      isPublic: ecosystem.membershipStyle === "open" || Math.random() < 0.5,
      ownerId: owner.id,
    });
  }

  const communities =
    "createManyAndReturn" in prisma.community
      ? await (prisma.community as any).createManyAndReturn({ data })
      : await prisma.$transaction(
          data.map((d) => prisma.community.create({ data: d }))
        );

  // Re-attach ecosystem data, host pools, cadence, and home location
  communities.forEach((community: any, index: number) => {
    const ecosystem = communityEcosystems[index] || {};
    const owner = ownerPool[Math.min(index, ownerPool.length - 1)];
    community.ecosystem = ecosystem;
    community.hostPool = [
      owner,
      ...sampleSize(
        users.filter((u) => u.id !== owner.id),
        30
      ),
    ];
    community.cadence = getCommunityEventCadence();
    // Thread home location through for events
    community.__homeLocationId = ecosystem.homeLocationId || null;
  });

  // Create membership tiers using LLM data
  const tiersToCreate: any[] = [];
  for (const c of communities) {
    const tiers = c.ecosystem?.membershipTiers || [];
    for (const tier of tiers) {
      tiersToCreate.push({
        communityId: c.id,
        name: tier.name,
        slug: slug(tier.name),
        description: tier.description,
        priceCents: tier.priceCents,
        currency: "USD",
        billingInterval: tier.priceCents
          ? rand([BillingInterval.MONTHLY, BillingInterval.YEARLY])
          : null,
        stripePriceId: null,
        isActive: true,
      });
    }

    // Add some faker tiers if LLM didn't provide enough
    const additionalTiers = faker.number.int({
      min: 0,
      max: Math.max(0, 3 - tiers.length),
    });
    for (let i = 0; i < additionalTiers; i++) {
      const name = faker.commerce.productName();
      tiersToCreate.push({
        communityId: c.id,
        name,
        slug: slug(name),
        description: faker.commerce.productDescription(),
        priceCents: faker.datatype.boolean()
          ? faker.number.int({ min: 500, max: 5000 })
          : null,
        currency: "USD",
        billingInterval: rand([
          BillingInterval.MONTHLY,
          BillingInterval.YEARLY,
        ]),
        stripePriceId: null,
        isActive: true,
      });
    }
  }

  const membershipTiers = tiersToCreate.length
    ? "createManyAndReturn" in prisma.membershipTier
      ? await (prisma.membershipTier as any).createManyAndReturn({
          data: tiersToCreate,
        })
      : await prisma.$transaction(
          tiersToCreate.map((t) => prisma.membershipTier.create({ data: t }))
        )
    : [];

  // Keep existing membership creation logic unchanged
  const membershipsToCreate: any[] = [];
  for (const c of communities) {
    const communityUsers = sampleSize(
      users,
      faker.number.int({ min: 5, max: 25 })
    );
    for (const u of communityUsers) {
      const role = faker.helpers.weightedArrayElement([
        { weight: 80, value: MembershipRole.MEMBER },
        { weight: 15, value: MembershipRole.MODERATOR },
        { weight: 5, value: MembershipRole.ADMIN },
      ]);
      const tier = membershipTiers.filter((t) => t.communityId === c.id);
      const pickTier = tier.length ? rand(tier) : null;
      membershipsToCreate.push({
        userId: u.id,
        communityId: c.id,
        role,
        membershipTierId: pickTier?.id ?? null,
        subscriptionStatus: pickTier
          ? rand(Object.values(SubscriptionStatus))
          : null,
        expiresAt:
          pickTier && faker.datatype.boolean()
            ? faker.date.soon({ days: 180 })
            : null,
        joinedAt: faker.date.past(),
      });
    }
  }

  if (membershipsToCreate.length) {
    if (prisma.communityMembership.createMany) {
      await prisma.communityMembership.createMany({
        data: membershipsToCreate,
      });
    } else {
      await prisma.$transaction(
        membershipsToCreate.map((m) =>
          prisma.communityMembership.create({ data: m })
        )
      );
    }
  }

  console.log(
    `✅ Created ${communities.length} communities with capped host pools and cadence`
  );
  return { communities, membershipTiers };
}

// Enhanced event creation for communities
async function createEventsForCommunitiesEnhanced(
  communities: any[],
  users: any[],
  categories: any[],
  images: string[],
  locations: any[]
) {
  const all: any[] = [];
  for (const community of communities) {
    const llmEvents = community.ecosystem?.events || [];
    const eventCount = Math.max(
      llmEvents.length,
      faker.number.int({ min: 2, max: MAX_EVENTS_PER_COMMUNITY })
    );

    // Use the capped host pool
    const hostCandidates = community.hostPool || users.slice(0, 30);

    // Get relevant categories for this community
    const relevantCategoryNames = new Set(
      community.ecosystem?.categories || []
    );
    const relevantCategories = categories.filter((c) =>
      relevantCategoryNames.has(c.name)
    );

    const communityEvents = await createEventsEnhanced(eventCount, {
      hostCandidates,
      categories: relevantCategories.length ? relevantCategories : categories,
      communityId: community.id,
      images,
      locations,
      llmEvents: llmEvents,
      communityEcosystem: community.ecosystem,
      cadence: community.cadence,
      communityName: community.name,
      homeLocationId: community.__homeLocationId, // PASS THROUGH HOME LOCATION
    });
    all.push(...communityEvents);
  }
  return all;
}

// Add missing createStandaloneEvents function
async function createStandaloneEvents(
  count: number,
  users: any[],
  categories: any[],
  images: string[],
  locations: any[]
) {
  console.log(`Creating ${count} standalone events...`);

  // Sample hosts from all users for standalone events
  const hostCandidates = sampleSize(users, Math.min(100, users.length));

  return await createEventsEnhanced(count, {
    hostCandidates,
    categories,
    communityId: null,
    images,
    locations,
    llmEvents: [],
    communityEcosystem: null,
    cadence: null,
    communityName: undefined,
  });
}

// Fix the RSVP generation section in createEventsEnhanced
async function createEventsEnhanced(
  count: number,
  opts: {
    hostCandidates: any[];
    categories: any[];
    communityId: string | null;
    images: string[];
    locations: any[];
    llmEvents?: any[];
    communityEcosystem?: any;
    cadence?: any;
    communityName?: string;
    homeLocationId?: string;
  }
) {
  const {
    hostCandidates,
    categories,
    communityId,
    images,
    locations,
    llmEvents = [],
    communityEcosystem,
    cadence,
    communityName,
    homeLocationId,
  } = opts;

  // Generate LLM top-ups for events beyond what LLM provided
  const neededTopUps = Math.max(0, count - llmEvents.length);
  const topUpEvents =
    neededTopUps > 0
      ? await generateEventTopUps(neededTopUps, communityName)
      : [];

  const events: any[] = [];
  for (let i = 0; i < count; i++) {
    const llmEvent = llmEvents[i];
    const topUpEvent =
      i >= llmEvents.length ? topUpEvents[i - llmEvents.length] : null;

    // Use LLM data, then top-up, then fallback
    const title =
      llmEvent?.title || topUpEvent?.title || faker.company.catchPhrase();
    const subtitle =
      llmEvent?.subtitle || topUpEvent?.subtitle || faker.company.buzzPhrase();
    const description =
      llmEvent?.description ||
      topUpEvent?.description ||
      faker.lorem.paragraphs(2);

    const locationType = rand([
      LocationType.PHYSICAL,
      LocationType.ONLINE,
      LocationType.HYBRID,
    ]);
    const coverImage = rand(images);

    // 40% past, 60% future events
    const isPast = Math.random() < 0.4;

    // Use community's home location when available
    let location = null;
    if (locationType !== LocationType.ONLINE) {
      if (homeLocationId) {
        location = locations.find((l) => l.id === homeLocationId);
      }
      if (!location) {
        location = rand(locations);
      }
    }

    // USE CADENCE FOR REALISTIC SCHEDULING
    const dateInfo = cadence
      ? getEventDateWithCadence(cadence, location, isPast)
      : getRealisticEventTime(location);

    const { venueName, venueAddress } = getRealisticVenue(
      location,
      locationType
    );
    const timezone = location?.timezone || "UTC";

    // Better status logic for past events
    let status = EventStatus.PUBLISHED;
    if (isPast && Math.random() < 0.05) {
      status = EventStatus.CANCELLED;
    } else if (!dateInfo.publishedAt) {
      status = EventStatus.DRAFT;
    }

    const eventData = {
      slug: uniqueSlug(title),
      title,
      subtitle,
      description,
      coverImage,
      startDate: dateInfo.start,
      endDate: dateInfo.end,
      timezone,
      locationId: location?.id || null,
      locationType,
      venueName,
      venueAddress,
      onlineUrl:
        locationType !== LocationType.PHYSICAL ? faker.internet.url() : null,
      capacity:
        llmEvent?.targetCapacity ||
        (Math.random() < 0.7 ? faker.number.int({ min: 30, max: 300 }) : null),
      isPublished: status === EventStatus.PUBLISHED,
      status,
      visibility: rand([
        EventVisibility.PUBLIC,
        EventVisibility.PRIVATE,
        EventVisibility.MEMBER_ONLY,
      ]),
      publishedAt: dateInfo.publishedAt,
      requiresApproval: Math.random() < 0.3,
      locationHiddenUntilApproved: Math.random() < 0.2,
      hostId: rand(hostCandidates).id,
      communityId,
      deletedAt: null,
      rsvpCount: 0,
      paidRsvpCount: 0,
      checkInCount: 0,
      viewCount: 0,
      createdAt: dateInfo.createdAt,
      // Store metadata for RSVP generation
      llmData: llmEvent,
    };

    events.push(eventData);
  }

  // Create events (removing llmData, isPast, eventType before saving)
  const eventsForDb = events.map(
    ({ llmData, isPast, eventType, ...rest }) => rest
  );
  const createdEvents =
    "createManyAndReturn" in prisma.event
      ? await (prisma.event as any).createManyAndReturn({ data: eventsForDb })
      : await prisma.$transaction(
          eventsForDb.map((e) => prisma.event.create({ data: e }))
        );

  // Re-attach LLM data
  createdEvents.forEach((event: any, index: number) => {
    event.llmData = events[index].llmData;
  });

  // Categories relation
  const eventCategoryRows: any[] = [];
  for (const e of createdEvents) {
    const catCount = faker.number.int({ min: 1, max: 3 });
    const cats = sampleSize(categories, catCount);
    for (const c of cats) {
      eventCategoryRows.push({ eventId: e.id, categoryId: c.id });
    }
  }
  if (eventCategoryRows.length) {
    if (prisma.eventCategory.createMany) {
      await prisma.eventCategory.createMany({
        data: eventCategoryRows,
        skipDuplicates: true,
      });
    } else {
      await prisma.$transaction(
        eventCategoryRows.map((r) => prisma.eventCategory.create({ data: r }))
      );
    }
  }

  // Enhanced ticket tiers using LLM data
  const ticketRows: any[] = [];
  for (const e of createdEvents) {
    const llmTiers = e.llmData?.ticketTiers || [];
    const tierCount = Math.max(
      llmTiers.length,
      faker.number.int({ min: 1, max: MAX_TICKET_TIERS_PER_EVENT })
    );

    for (let i = 0; i < tierCount; i++) {
      const llmTier = llmTiers[i];
      const name = llmTier?.name || faker.commerce.productName();

      ticketRows.push({
        eventId: e.id,
        name,
        description:
          llmTier?.description || faker.commerce.productDescription(),
        priceCents:
          llmTier?.priceCents || faker.number.int({ min: 0, max: 15000 }),
        currency: "USD",
        quantityTotal:
          llmTier?.capacity ||
          (faker.datatype.boolean()
            ? faker.number.int({ min: 20, max: 200 })
            : null),
        quantitySold: 0,
        visibility: rand([
          TicketVisibility.PUBLIC,
          TicketVisibility.CODE_REQUIRED,
          TicketVisibility.HIDDEN,
        ]),
        salesStart: faker.date.past(),
        salesEnd: faker.date.soon({ days: 200 }),
      });
    }
  }

  const ticketTiers = ticketRows.length
    ? "createManyAndReturn" in prisma.ticketTier
      ? await (prisma.ticketTier as any).createManyAndReturn({
          data: ticketRows,
        })
      : await prisma.$transaction(
          ticketRows.map((t) => prisma.ticketTier.create({ data: t }))
        )
    : [];

  // Enhanced promo codes using LLM data
  const promoRows: any[] = [];
  for (const e of createdEvents) {
    const llmPromos = e.llmData?.promoCodes || [];
    const promoCount = Math.max(
      llmPromos.length,
      faker.number.int({ min: 0, max: MAX_PROMO_CODES_PER_EVENT })
    );

    for (let i = 0; i < promoCount; i++) {
      const llmPromo = llmPromos[i];
      const appliesToAll = faker.datatype.boolean();

      const pc = {
        eventId: e.id,
        code:
          llmPromo?.code ||
          faker.string.alphanumeric({ length: 8, casing: "upper" }),
        discountType: llmPromo?.discountPercent
          ? DiscountType.PERCENT
          : rand([DiscountType.AMOUNT, DiscountType.PERCENT]),
        amountOffCents: null as number | null,
        percentOff: null as number | null,
        maxRedemptions: faker.datatype.boolean()
          ? faker.number.int({ min: 5, max: 100 })
          : null,
        redeemedCount: 0,
        startsAt: faker.date.past(),
        endsAt: faker.date.soon({ days: 180 }),
        appliesToAllTiers: appliesToAll,
      };

      if (pc.discountType === DiscountType.AMOUNT) {
        pc.amountOffCents = faker.number.int({ min: 100, max: 5000 });
      } else {
        pc.percentOff =
          llmPromo?.discountPercent || faker.number.int({ min: 5, max: 80 });
      }
      promoRows.push(pc);
    }
  }

  // INSERT PROMO CODES FIRST AND GET REAL IDs
  const createdPromoCodes = promoRows.length
    ? "createManyAndReturn" in prisma.promoCode
      ? await (prisma.promoCode as any).createManyAndReturn({ data: promoRows })
      : await prisma.$transaction(
          promoRows.map((p) => prisma.promoCode.create({ data: p }))
        )
    : [];

  // NOW CREATE PROMO TIERS WITH REAL IDs
  const promoTiersRows: any[] = [];
  for (const promo of createdPromoCodes) {
    if (!promo.appliesToAllTiers) {
      const eventTiers = ticketTiers.filter((t) => t.eventId === promo.eventId);
      const chosen = sampleSize(
        eventTiers,
        faker.number.int({ min: 1, max: eventTiers.length || 1 })
      );
      chosen.forEach((t) => {
        promoTiersRows.push({
          ticketTierId: t.id,
          promoCodeId: promo.id, // REAL ID NOW, NOT 'TEMP'
        });
      });
    }
  }

  if (promoTiersRows.length) {
    if (prisma.promoCodeTier.createMany) {
      await prisma.promoCodeTier.createMany({ data: promoTiersRows });
    } else {
      await prisma.$transaction(
        promoTiersRows.map((pt) => prisma.promoCodeTier.create({ data: pt }))
      );
    }
  }

  async function maybeLLMQuestionPack(e: any, count: number) {
    if (!USE_LLM || count === 0) return null;
    const prompt = `Generate ${count} registration form questions for an event titled "${e.title}". Mix types: short_text, long_text, single_select, multi_select, checkbox. Return JSON { "questions": [{ "type": "short_text|long_text|single_select|multi_select|checkbox", "label": "...", "options": ["opt1","opt2"] }] }`;
    try {
      const res = await callLLM(prompt, 1000);
      const parsed = extractFirstJSONObject(res);
      return parsed?.questions || null;
    } catch {
      return null;
    }
  }

  // Registration questions
  const questionRows: any[] = [];
  for (const e of createdEvents) {
    const qCount = faker.number.int({
      min: 0,
      max: MAX_REG_QUESTIONS_PER_EVENT,
    });
    for (let i = 0; i < qCount; i++) {
      const type = rand([
        QuestionType.SHORT_TEXT,
        QuestionType.LONG_TEXT,
        QuestionType.SINGLE_SELECT,
        QuestionType.MULTI_SELECT,
        QuestionType.CHECKBOX,
        QuestionType.TERMS,
        QuestionType.SIGNATURE,
      ]);
      questionRows.push({
        eventId: e.id,
        type,
        label: faker.lorem.sentence(),
        required: faker.datatype.boolean(),
        position: i,
        options:
          type === QuestionType.SINGLE_SELECT ||
          type === QuestionType.MULTI_SELECT
            ? [
                faker.commerce.productAdjective(),
                faker.commerce.productAdjective(),
                faker.commerce.productAdjective(),
              ]
            : [],
      });
    }
  }
  const questions = questionRows.length
    ? "createManyAndReturn" in prisma.registrationQuestion
      ? await (prisma.registrationQuestion as any).createManyAndReturn({
          data: questionRows,
        })
      : await prisma.$transaction(
          questionRows.map((q) =>
            prisma.registrationQuestion.create({ data: q })
          )
        )
    : [];

  // Event collaborators
  const collabRows: any[] = [];
  for (const e of createdEvents) {
    const countCollabs = faker.number.int({
      min: 0,
      max: MAX_COLLABORATORS_PER_EVENT,
    });
    const collabUsers = sampleSize(hostCandidates, countCollabs);
    for (const u of collabUsers) {
      collabRows.push({
        eventId: e.id,
        userId: u.id,
        role: rand([EventRole.CO_HOST, EventRole.MANAGER, EventRole.CHECKIN]),
      });
    }
  }
  if (collabRows.length) {
    if (prisma.eventCollaborator.createMany) {
      await prisma.eventCollaborator.createMany({
        data: collabRows,
        skipDuplicates: true,
      });
    } else {
      await prisma.$transaction(
        collabRows.map((c) => prisma.eventCollaborator.create({ data: c }))
      );
    }
  }

  // Event referrals
  const referralRows: any[] = [];
  for (const e of createdEvents) {
    const countRef = faker.number.int({ min: 0, max: 5 });
    for (let i = 0; i < countRef; i++) {
      referralRows.push({
        eventId: e.id,
        userId: faker.datatype.boolean() ? rand(hostCandidates).id : null,
        code: faker.string.alphanumeric({ length: 6 }),
        uses: 0,
      });
    }
  }
  const referrals = referralRows.length
    ? "createManyAndReturn" in prisma.eventReferral
      ? await (prisma.eventReferral as any).createManyAndReturn({
          data: referralRows,
        })
      : await prisma.$transaction(
          referralRows.map((r) => prisma.eventReferral.create({ data: r }))
        )
    : [];

  // Orders + Payments + RSVPs (+ Answers, CheckIns, Feedback, Waitlist)
  const orderRows: any[] = [];
  const orderItemsRows: any[] = [];
  const paymentRows: any[] = [];
  const refundRows: any[] = [];
  const rsvpRows: any[] = [];
  const answerRows: any[] = [];
  const checkInRows: any[] = [];
  const feedbackRows: any[] = [];
  const viewRows: any[] = [];

  for (const e of createdEvents) {
    // DERIVE VIEWS AND RSVPS BY CONSTRUCTION
    const baseViewCount =
      e.status === EventStatus.PUBLISHED
        ? faker.number.int({ min: 20, max: 300 })
        : faker.number.int({ min: 2, max: 30 });
    const statusMultiplier = e.status === EventStatus.CANCELLED ? 1.4 : 1.0;
    const viewsCount = Math.floor(baseViewCount * statusMultiplier);

    // Generate views - fix timestamp range
    for (let v = 0; v < viewsCount; v++) {
      const viewer = Math.random() < 0.3 ? rand(hostCandidates) : null;
      viewRows.push({
        eventId: e.id,
        userId: viewer?.id ?? null,
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        referrer: faker.internet.url(),
        viewedAt: faker.date.between({
          from: e.createdAt,
          to: e.startDate < new Date() ? e.startDate : new Date(),
        }),
      });
    }

    const tiers = ticketTiers.filter((t) => t.eventId === e.id);
    const hasPaidTiers = tiers.some((t) => t.priceCents > 0);

    // DERIVE RSVP COUNT FROM VIEWS - fix eventType reference
    const eventFlavor = (e as any).llmData?.eventType || "networking";
    const { rsvpTarget } = generateRSVPsFromViews(
      viewsCount,
      eventFlavor,
      hasPaidTiers
    );

    const capacity = e.capacity ?? Infinity;
    let confirmedCount = 0;
    let waitlistPosition = 1;
    let checkInCount = 0;

    // Create orders for paid tickets (proportional to RSVPs)
    if (hasPaidTiers && rsvpTarget > 0) {
      const orderCount = Math.min(
        Math.ceil(rsvpTarget * 0.8), // Most RSVPs come from orders
        faker.number.int({ min: 3, max: 25 })
      );

      for (let i = 0; i < orderCount; i++) {
        const buyer = rand(hostCandidates);
        const itemsForOrder = sampleSize(
          tiers.filter((t) => t.priceCents > 0),
          faker.number.int({ min: 1, max: Math.min(2, tiers.length) })
        );

        const quantities = itemsForOrder.map(() =>
          faker.number.int({ min: 1, max: 4 })
        );
        const totalCents = itemsForOrder.reduce(
          (sum, t, idx) => sum + t.priceCents * quantities[idx],
          0
        );

        const status = rand([
          OrderStatus.PENDING,
          OrderStatus.PAID,
          OrderStatus.CANCELLED,
        ]);
        const orderId = faker.string.uuid();

        orderRows.push({
          id: orderId,
          eventId: e.id,
          purchaserEmail: buyer.email,
          purchaserName: buyer.name,
          status,
          totalCents,
          currency: "USD",
          refundedCents: 0,
          appliedPromoCodeId: faker.datatype.boolean()
            ? rand(createdPromoCodes.filter((pc) => pc.eventId === e.id))?.id ??
              null
            : null,
          idempotencyKey: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        });

        itemsForOrder.forEach((t, idx) => {
          orderItemsRows.push({
            orderId,
            ticketTierId: t.id,
            quantity: quantities[idx],
            priceCents: t.priceCents,
          });
        });

        // Payments
        const attempts = faker.number.int({ min: 1, max: 2 });
        for (let a = 1; a <= attempts; a++) {
          const succeeded = a === attempts && status === OrderStatus.PAID;
          const paymentId = faker.string.uuid();
          paymentRows.push({
            id: paymentId,
            orderId,
            attemptNumber: a,
            provider: "stripe",
            providerIntentId: faker.string.uuid(),
            providerChargeId: succeeded ? faker.string.uuid() : null,
            status: succeeded
              ? PaymentStatus.SUCCEEDED
              : rand([
                  PaymentStatus.PENDING,
                  PaymentStatus.FAILED,
                  PaymentStatus.CANCELLED,
                ]),
            amountCents: totalCents,
            currency: "USD",
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
          });

          // occasional refunds
          if (succeeded && faker.datatype.boolean({ probability: 0.05 })) {
            const refundAmount = faker.number.int({ min: 0, max: totalCents });
            refundRows.push({
              id: faker.string.uuid(),
              paymentId,
              amountCents: refundAmount,
              reason: faker.lorem.sentence(),
              providerRefundId: faker.string.alphanumeric(12),
              createdAt: faker.date.recent(),
            });
          }
        }
      }
    }

    // RSVPs (paid + free)
    for (let i = 0; i < rsvpTarget; i++) {
      const user = faker.datatype.boolean() ? rand(hostCandidates) : null;
      const email = user?.email ?? faker.internet.email();
      const name = user?.name ?? faker.person.fullName();

      let status = RsvpStatus.CONFIRMED;
      let paymentState: PaymentState = PaymentState.NONE;
      let ticketTierId: string | null = null;
      let orderId: string | null = null;

      if (hasPaidTiers && faker.datatype.boolean({ probability: 0.7 })) {
        // tie to an order item if exists
        const paidOrder = rand(
          orderRows.filter(
            (o) => o.eventId === e.id && o.status === OrderStatus.PAID
          )
        );
        if (paidOrder) {
          orderId = paidOrder.id;
          const items = orderItemsRows.filter(
            (oi) => oi.orderId === paidOrder.id
          );
          if (items.length) {
            ticketTierId = rand(items).ticketTierId;
            paymentState = PaymentState.PAID;
          }
        }
      } else {
        // free tier if present
        const freeTiers = tiers.filter((t) => t.priceCents === 0);
        if (freeTiers.length) ticketTierId = rand(freeTiers).id;
      }

      // capacity handling
      let currentWaitlistPosition: number | null = null;
      if (confirmedCount >= capacity) {
        status = RsvpStatus.WAITLIST;
        currentWaitlistPosition = waitlistPosition++;
      } else {
        confirmedCount++;
      }

      // Link to a referral only after we have IDs; keep null here to avoid TDZ/undefined
      const referral = null;

      const rsvpId = faker.string.uuid();
      rsvpRows.push({
        id: rsvpId,
        eventId: e.id,
        ticketTierId,
        userId: user?.id ?? null,
        orderId,
        email,
        name,
        status,
        paymentState,
        waitlistPosition: currentWaitlistPosition,
        referralId: referral,
        createdAt: faker.date.past(),
      });

      // Registration answers
      const qs = questions.filter((q) => q.eventId === e.id);
      for (const q of qs) {
        if (!q.required && faker.datatype.boolean({ probability: 0.4 }))
          continue;
        let value: string;
        switch (q.type) {
          case QuestionType.SHORT_TEXT:
          case QuestionType.LONG_TEXT:
            value = faker.lorem.sentence();
            break;
          case QuestionType.SINGLE_SELECT:
            value = rand(q.options);
            break;
          case QuestionType.MULTI_SELECT:
            value = JSON.stringify(
              sampleSize(
                q.options,
                faker.number.int({ min: 1, max: q.options.length })
              )
            );
            break;
          case QuestionType.CHECKBOX:
            value = faker.datatype.boolean().toString();
            break;
          case QuestionType.TERMS:
          case QuestionType.SIGNATURE:
            value = "true";
            break;
          default:
            value = "";
        }
        answerRows.push({
          id: faker.string.uuid(),
          rsvpId,
          questionId: q.id,
          value,
        });
      }

      // Check-in
      if (
        status === RsvpStatus.CONFIRMED &&
        faker.datatype.boolean({ probability: 0.6 })
      ) {
        checkInRows.push({
          id: faker.string.uuid(),
          rsvpId,
          scannedAt: faker.date.recent(),
        });
      }

      // Feedback
      if (
        status === RsvpStatus.CONFIRMED &&
        faker.datatype.boolean({ probability: 0.3 })
      ) {
        feedbackRows.push({
          id: faker.string.uuid(),
          eventId: e.id,
          rsvpId,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.datatype.boolean()
            ? faker.lorem.sentences({ min: 1, max: 3 })
            : null,
          createdAt: faker.date.recent(),
        });
      }
    }

    // Update counters later after inserts
  }

  // Bulk inserts
  if (viewRows.length) {
    if (prisma.eventView.createMany)
      await prisma.eventView.createMany({ data: viewRows });
    else
      await prisma.$transaction(
        viewRows.map((r) => prisma.eventView.create({ data: r }))
      );
  }

  if (orderRows.length) {
    if (prisma.order.createMany)
      await prisma.order.createMany({ data: orderRows });
    else
      await prisma.$transaction(
        orderRows.map((o) => prisma.order.create({ data: o }))
      );
  }
  if (orderItemsRows.length) {
    if (prisma.orderItem.createMany)
      await prisma.orderItem.createMany({ data: orderItemsRows });
    else
      await prisma.$transaction(
        orderItemsRows.map((oi) => prisma.orderItem.create({ data: oi }))
      );
  }
  if (paymentRows.length) {
    if (prisma.payment.createMany)
      await prisma.payment.createMany({ data: paymentRows });
    else
      await prisma.$transaction(
        paymentRows.map((p) => prisma.payment.create({ data: p }))
      );
  }
  if (refundRows.length) {
    if (prisma.refund.createMany)
      await prisma.refund.createMany({ data: refundRows });
    else
      await prisma.$transaction(
        refundRows.map((r) => prisma.refund.create({ data: r }))
      );
  }
  if (rsvpRows.length) {
    if (prisma.rsvp.createMany) await prisma.rsvp.createMany({ data: rsvpRows })
    else await prisma.$transaction(rsvpRows.map((r) => prisma.rsvp.create({ data: r })))
  }
  if (answerRows.length) {
    if (prisma.registrationAnswer.createMany) await prisma.registrationAnswer.createMany({ data: answerRows })
    else await prisma.$transaction(answerRows.map((a) => prisma.registrationAnswer.create({ data: a })))
  }
  if (checkInRows.length) {
    if (prisma.checkIn.createMany) await prisma.checkIn.createMany({ data: checkInRows })
    else await prisma.$transaction(checkInRows.map((c) => prisma.checkIn.create({ data: c })))
  }
  if (feedbackRows.length) {
    if (prisma.eventFeedback.createMany) await prisma.eventFeedback.createMany({ data: feedbackRows })
    else await prisma.$transaction(feedbackRows.map((f) => prisma.eventFeedback.create({ data: f })))
  }

  // --- Recompute per-event counters from inserted rows (consistency by construction)
  type Counter = { views: number; rsvps: number; paid: number; checkins: number }
  const counters = new Map<string, Counter>()
  const bump = (id: string, field: keyof Counter, inc = 1) => {
    const base = counters.get(id) || { views: 0, rsvps: 0, paid: 0, checkins: 0 }
    base[field] += inc
    counters.set(id, base)
  }
  for (const v of viewRows) bump(v.eventId, 'views')
  for (const r of rsvpRows) {
    bump(r.eventId, 'rsvps')
    if (r.paymentState === PaymentState.PAID) bump(r.eventId, 'paid')
  }
  for (const c of checkInRows) {
    const r = rsvpRows.find((rr) => rr.id === c.rsvpId)
    if (r) bump(r.eventId, 'checkins')
  }

  const updates = Array.from(counters.entries()).map(([eventId, c]) =>
    prisma.event.update({
      where: { id: eventId },
      data: {
        viewCount: c.views,
        rsvpCount: c.rsvps,
        paidRsvpCount: c.paid,
        checkInCount: c.checkins,
      },
    })
  )
  if (updates.length) await prisma.$transaction(updates)

  return createdEvents
}

// --- DAILY STATS -----------------------------------------
async function backfillDailyStats(events: any[]) {
  const rows: any[] = []
  for (const e of events) {
    const [viewCount, rsvpCount, paidRsvpCount] = await Promise.all([
      prisma.eventView.count({ where: { eventId: e.id } }),
      prisma.rsvp.count({ where: { eventId: e.id } }),
      prisma.rsvp.count({ where: { eventId: e.id, paymentState: PaymentState.PAID } }),
    ])
    const dayCount = faker.number.int({ min: 6, max: 18 })
    const weights = Array.from({ length: dayCount }, () => Math.random() + 0.4)
    const bumpIdx1 = Math.max(0, dayCount - 7)
    const bumpIdx2 = Math.max(0, dayCount - 3)
    if (dayCount > 4) { weights[bumpIdx1] *= 1.8; weights[bumpIdx2] *= 1.5 }
    const sumW = weights.reduce((a, b) => a + b, 0)
    const alloc = (total: number) => {
      const a = weights.map((w) => Math.floor((w / sumW) * total))
      let left = total - a.reduce((x, y) => x + y, 0)
      for (let i = 0; left > 0; i = (i + 1) % dayCount) { a[i]++; left-- }
      return a
    }
    const viewsA = alloc(viewCount)
    const uniqA = viewsA.map((v) => Math.max(0, Math.floor(v * faker.number.float({ min: 0.6, max: 0.95 }))))
    const rsvpA = alloc(rsvpCount)
    const paidA = alloc(paidRsvpCount)

    const base = e.createdAt ?? faker.date.past({ years: 1 })
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(base.getTime() + i * 24 * 60 * 60 * 1000)
      rows.push({
        eventId: e.id,
        date,
        views: viewsA[i],
        uniqueViews: Math.min(uniqA[i], viewsA[i]),
        rsvps: rsvpA[i],
        paidRsvps: Math.min(paidA[i], rsvpA[i]),
      })
    }
  }
  if (rows.length) {
    if (prisma.eventDailyStat.createMany) await prisma.eventDailyStat.createMany({ data: rows })
    else await prisma.$transaction(rows.map((r) => prisma.eventDailyStat.create({ data: r })))
  }
}

// --- CATEGORY HELPER (idempotent) ------------------------
async function createCategoriesFromCommunities(communities: any[]): Promise<any[]> {
  console.log('🏷️  Ensuring categories from ecosystems...')
  const namesSet = new Set<string>()
  for (const c of communities) {
    const arr = (c.ecosystem?.categories || []) as string[]
    for (const n of arr) if (n && n.trim()) namesSet.add(n.trim())
  }
  const fallback = [
    'Engineering','Design','Product','Data','DevOps','Cloud','Security','Mobile','Web','AI/ML','Startups','Open Source','Growth','Community','Leadership'
  ]
  if (namesSet.size === 0) fallback.forEach((n) => namesSet.add(n))

  const names = Array.from(namesSet).slice(0, MAX_CATEGORIES)
  const seen = new Set<string>()
  const data = names.map((name) => {
    let s = slug(name); let i = 2
    while (seen.has(s)) { s = `${slug(name)}-${i++}` }
    seen.add(s)
    return { name, slug: s }
  })

  if ('createMany' in prisma.category) {
    await prisma.category.createMany({ data, skipDuplicates: true })
  } else {
    await prisma.$transaction(
      data.map((d) => prisma.category.upsert({ where: { slug: d.slug }, update: {}, create: d }))
    )
  }
  const created = await prisma.category.findMany({ where: { slug: { in: data.map((d) => d.slug) } } })
  console.log(`✅ Ensured ${created.length} categories`)
  return created
}

// --- IMAGE HELPER (Unsplash → Picsum fallback) -----------
async function fetchUnsplashImagesOrPicsum(count: number): Promise<string[]> {
  try {
    const url = `https://api.unsplash.com/collections/${COLLECTION_ID}/photos?per_page=${count}&client_id=${ACCESS_KEY}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      const imgs = data
        .map((img: any) => img?.urls?.regular || img?.urls?.full || img?.urls?.small)
        .filter(Boolean)
      if (imgs.length >= Math.min(20, count)) return imgs
    }
  } catch (e) {
    console.warn('Unsplash failed, using picsum:', (e as any)?.message || e)
  }
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/rsvped-${i}/1280/720`)
}

// --- OPTIONAL: feedback enhancer (safe no-op) -------------
async function enhanceEventFeedback(events: any[], users: any[]) {
  try { await generateRealisticFeedback(events, users) } catch {}
}

// --- WIPE (preserve Locations only in wipe mode) ----------
async function wipeDb() {
  if (!SHOULD_WIPE) { console.log('⚠️ Database wipe skipped (SHOULD_WIPE=false)'); return }
  if (SEED_MODE !== 'wipe') { console.log('➕ Append mode: not wiping any data.'); return }
  console.log('🧹 Wiping database (preserving Locations)...')
  const del = async (name: string, delegate: any) => {
    const count = await delegate.count(); if (count) { await delegate.deleteMany({}); console.log(`  Deleted ${count} ${name}`) }
  }
  // Delete in proper order: children first, then parents
  await del('Refund', prisma.refund)
  await del('EventFeedback', prisma.eventFeedback)
  await del('CheckIn', prisma.checkIn)
  await del('RegistrationAnswer', prisma.registrationAnswer)
  await del('Rsvp', prisma.rsvp)
  await del('OrderItem', prisma.orderItem)
  await del('Payment', prisma.payment)
  await del('Order', prisma.order)
  await del('PromoCodeTier', prisma.promoCodeTier)
  await del('PromoCode', prisma.promoCode)
  await del('TicketTier', prisma.ticketTier)
  await del('EventCategory', prisma.eventCategory)
  await del('EventView', prisma.eventView)
  await del('EventDailyStat', prisma.eventDailyStat)
  await del('EventMessage', prisma.eventMessage)
  await del('EventReferral', prisma.eventReferral)
  await del('EventCollaborator', prisma.eventCollaborator)
  await del('RegistrationQuestion', prisma.registrationQuestion)
  await del('Event', prisma.event)
  await del('CommunityMembership', prisma.communityMembership)
  await del('MembershipTier', prisma.membershipTier)
  await del('Community', prisma.community)
  await del('Category', prisma.category)
  await del('Account', prisma.account)
  await del('Session', prisma.session)
  await del('VerificationToken', prisma.verificationToken)
  await del('User', prisma.user)
  console.log('✅ Wipe complete. Locations preserved.')
}

// --- MAIN -------------------------------------------------
async function main() {
  console.log(`🚦 SEED_MODE=${SEED_MODE} (wipe preserves only Locations; append adds data)`) 
  await wipeDb()

  // Ensure locations exist
  const locations = await prisma.location.findMany()
  if (!locations.length) throw new Error('No locations found. Insert Location rows first.')
  console.log(`🌍 Using ${locations.length} existing locations`)

  // Images
  const images = await fetchUnsplashImagesOrPicsum(200)

  // Users
  const users = await createUsers(NUM_USERS, locations)

  // Communities
  const { communities } = await createCommunities(users, images, locations)

  // Categories (idempotent)
  const categories = await createCategoriesFromCommunities(communities)

  // Events for communities
  const allEvents = await createEventsForCommunitiesEnhanced(
    communities,
    users,
    categories,
    images,
    locations
  )

  // Standalone events
  const standaloneEvents = await createStandaloneEvents(
    EXTRA_STANDALONE_EVENTS,
    users,
    categories,
    images,
    locations
  )

  // Stats & optional feedback
  await backfillDailyStats([...allEvents, ...standaloneEvents])
  await enhanceEventFeedback([...allEvents, ...standaloneEvents], users)

  console.log('🎉 Seed complete:', {
    users: users.length,
    communities: communities.length,
    events: allEvents.length + standaloneEvents.length,
  })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
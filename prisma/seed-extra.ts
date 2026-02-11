/**
 * Extra seed data: 40+ additional horeca properties across Netherlands
 * Run with: bun prisma/seed-extra.ts
 */

import { PrismaClient, PropertyImageType } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const IMAGES = {
  restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
  ],
  bar: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
  ],
  hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
  ],
  lunchroom: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
  ],
};

interface SeedProperty {
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  city: string;
  address: string;
  zipCode: string;
  lat: number;
  lng: number;
  rentPrice: number;
  surfaceTotal: number;
  buildYear: number;
  seatingCapacityInside: number;
  seatingCapacityOutside: number;
  images: string[];
}

const EXTRA_PROPERTIES: SeedProperty[] = [
  // Amsterdam (10)
  { title: "Trendy Cocktailbar Leidseplein", slug: "trendy-cocktailbar-leidseplein", description: "Stijlvolle cocktailbar op toplocatie aan het Leidseplein. Volledig gerenoveerd interieur met professionele bar. Ideaal voor een concept met focus op ambachtelijke cocktails. Drankvergunning en terrasvergunning aanwezig.", propertyType: "COCKTAILBAR", city: "Amsterdam", address: "Leidseplein 18", zipCode: "1017PT", lat: 52.3636, lng: 4.8828, rentPrice: 850000, surfaceTotal: 120, buildYear: 1925, seatingCapacityInside: 60, seatingCapacityOutside: 30, images: IMAGES.bar },
  { title: "Authentiek Italiaans Restaurant De Pijp", slug: "authentiek-italiaans-restaurant-de-pijp", description: "Charmant hoekpand in De Pijp, perfect voor een Italiaans restaurant. Volledig uitgeruste keuken met pizza-oven. Grote ramen voor natuurlijk licht. Kelder beschikbaar voor opslag.", propertyType: "RESTAURANT", city: "Amsterdam", address: "Albert Cuypstraat 147", zipCode: "1073BE", lat: 52.3557, lng: 4.8952, rentPrice: 650000, surfaceTotal: 180, buildYear: 1910, seatingCapacityInside: 70, seatingCapacityOutside: 24, images: IMAGES.restaurant },
  { title: "Boutique Hotel Jordaan", slug: "boutique-hotel-jordaan", description: "Uniek grachtenpand in de Jordaan, geschikt als boutique hotel met 12-15 kamers. Monumentaal pand met originele details. Lift aanwezig. Vergunning voor hotelexploitatie.", propertyType: "HOTEL", city: "Amsterdam", address: "Prinsengracht 267", zipCode: "1016GV", lat: 52.3752, lng: 4.8840, rentPrice: 1500000, surfaceTotal: 450, buildYear: 1680, seatingCapacityInside: 30, seatingCapacityOutside: 0, images: IMAGES.hotel },
  { title: "Hippe Lunchroom Oud-West", slug: "hippe-lunchroom-oud-west", description: "Lichte, moderne ruimte in Oud-West. Ideaal voor een lunchroom of koffiebar concept. Grote etalage, open keuken. Buurt met veel jonge professionals.", propertyType: "LUNCHROOM", city: "Amsterdam", address: "Kinkerstraat 88", zipCode: "1053EC", lat: 52.3687, lng: 4.8672, rentPrice: 380000, surfaceTotal: 85, buildYear: 1935, seatingCapacityInside: 35, seatingCapacityOutside: 12, images: IMAGES.lunchroom },
  { title: "Grand Café Rembrandtplein", slug: "grand-cafe-rembrandtplein", description: "Ruim grand café op het Rembrandtplein. Twee verdiepingen, groot terras op het plein. Professionele bar en keuken. Uitstekende zichtlocatie met hoge passantenstromen.", propertyType: "GRAND_CAFE", city: "Amsterdam", address: "Rembrandtplein 12", zipCode: "1017CV", lat: 52.3660, lng: 4.8967, rentPrice: 950000, surfaceTotal: 280, buildYear: 1890, seatingCapacityInside: 120, seatingCapacityOutside: 60, images: IMAGES.cafe },
  { title: "Sushi Restaurant Zuidas", slug: "sushi-restaurant-zuidas", description: "Modern pand op de Zuidas, ideaal voor een high-end sushi restaurant. Open keuken concept, industrieel design. Bereikbaar met OV en parkeergarage nabij.", propertyType: "RESTAURANT", city: "Amsterdam", address: "Gustav Mahlerlaan 10", zipCode: "1082PP", lat: 52.3389, lng: 4.8742, rentPrice: 720000, surfaceTotal: 160, buildYear: 2008, seatingCapacityInside: 55, seatingCapacityOutside: 0, images: IMAGES.restaurant },
  { title: "Eetcafé NDSM Werf", slug: "eetcafe-ndsm-werf", description: "Karakteristiek pand op de NDSM-werf. Rauwe, industriële sfeer. Groot terras aan het water met uitzicht op het IJ. Perfect voor een casual dining concept.", propertyType: "EETCAFE", city: "Amsterdam", address: "NDSM-plein 28", zipCode: "1033WB", lat: 52.4012, lng: 4.8937, rentPrice: 420000, surfaceTotal: 200, buildYear: 1955, seatingCapacityInside: 80, seatingCapacityOutside: 50, images: IMAGES.cafe },
  { title: "Koffiebar Haarlemmerstraat", slug: "koffiebar-haarlemmerstraat", description: "Klein maar fijn hoekpand aan de Haarlemmerstraat. Ideaal voor specialty coffee concept. Drukke winkelstraat met hoge passantenstromen.", propertyType: "KOFFIEBAR", city: "Amsterdam", address: "Haarlemmerstraat 52", zipCode: "1013ES", lat: 52.3810, lng: 4.8878, rentPrice: 280000, surfaceTotal: 55, buildYear: 1920, seatingCapacityInside: 20, seatingCapacityOutside: 8, images: IMAGES.lunchroom },
  { title: "Nachtclub Warmoesstraat", slug: "nachtclub-warmoesstraat", description: "Clublocatie in het centrum met professioneel geluidssysteem en lichtinstallatie. Twee dancefloors, VIP-ruimte, en backstage faciliteiten. Nachtvergunning tot 05:00.", propertyType: "NIGHTCLUB", city: "Amsterdam", address: "Warmoesstraat 96", zipCode: "1012JH", lat: 52.3749, lng: 4.8980, rentPrice: 1100000, surfaceTotal: 350, buildYear: 1970, seatingCapacityInside: 300, seatingCapacityOutside: 0, images: IMAGES.bar },
  { title: "Dark Kitchen Sloterdijk", slug: "dark-kitchen-sloterdijk", description: "Efficiënte keukenruimte bij station Sloterdijk. Geschikt voor delivery-only concepten. Industriële ventilatie, 3-fase stroom, laadperron.", propertyType: "DARK_KITCHEN", city: "Amsterdam", address: "Naritaweg 15", zipCode: "1043BP", lat: 52.3895, lng: 4.8365, rentPrice: 250000, surfaceTotal: 100, buildYear: 1998, seatingCapacityInside: 0, seatingCapacityOutside: 0, images: IMAGES.restaurant },

  // Rotterdam (8)
  { title: "Rooftop Bar Kop van Zuid", slug: "rooftop-bar-kop-van-zuid", description: "Spectaculaire rooftop locatie op de Kop van Zuid met panoramisch uitzicht over de Maas en de skyline. Volledig uitgerust met bar, lounge en buitenterras.", propertyType: "BAR", city: "Rotterdam", address: "Wilhelminakade 137", zipCode: "3072AP", lat: 51.9052, lng: 4.4870, rentPrice: 780000, surfaceTotal: 200, buildYear: 2015, seatingCapacityInside: 80, seatingCapacityOutside: 60, images: IMAGES.bar },
  { title: "Pizzeria Witte de Withstraat", slug: "pizzeria-witte-de-withstraat", description: "Gezellig pand aan Rotterdam's uitgaansstraat. Bestaande pizza-oven en afzuiginstallatie. Hoge plafonds, karakteristiek interieur.", propertyType: "PIZZERIA", city: "Rotterdam", address: "Witte de Withstraat 45", zipCode: "3012BL", lat: 51.9178, lng: 4.4753, rentPrice: 380000, surfaceTotal: 110, buildYear: 1930, seatingCapacityInside: 45, seatingCapacityOutside: 16, images: IMAGES.restaurant },
  { title: "Food Hall Markthal", slug: "food-hall-markthal", description: "Unieke locatie in de iconische Markthal. High traffic locatie met miljoenen bezoekers per jaar. Geschikt voor streetfood, deli of vers concept.", propertyType: "RESTAURANT", city: "Rotterdam", address: "Dominee Jan Scharpstraat 298", zipCode: "3011GZ", lat: 51.9200, lng: 4.4866, rentPrice: 550000, surfaceTotal: 75, buildYear: 2014, seatingCapacityInside: 30, seatingCapacityOutside: 0, images: IMAGES.restaurant },
  { title: "Brasserie Kralingen", slug: "brasserie-kralingen", description: "Stijlvolle brasserie aan de Kralingse Plas. Groot terras met wateruitzicht. Perfecte locatie voor een all-day dining concept.", propertyType: "RESTAURANT", city: "Rotterdam", address: "Kralingse Plaslaan 120", zipCode: "3062DE", lat: 51.9310, lng: 4.5085, rentPrice: 520000, surfaceTotal: 190, buildYear: 1960, seatingCapacityInside: 75, seatingCapacityOutside: 45, images: IMAGES.restaurant },
  { title: "Café Oude Haven", slug: "cafe-oude-haven", description: "Klassiek bruin café aan de Oude Haven met uitzicht op de Kubuswoningen. Authentieke sfeer, trouwe klantenkring. Overname inventaris mogelijk.", propertyType: "CAFE", city: "Rotterdam", address: "Oude Haven 8", zipCode: "3011GE", lat: 51.9206, lng: 4.4929, rentPrice: 320000, surfaceTotal: 95, buildYear: 1905, seatingCapacityInside: 40, seatingCapacityOutside: 20, images: IMAGES.cafe },
  { title: "Hotel Centraal Station", slug: "hotel-centraal-station-rotterdam", description: "Groot pand nabij Rotterdam Centraal, geschikt voor budget hotel of hostel concept. 20+ kamers mogelijk. Uitstekende OV-bereikbaarheid.", propertyType: "HOTEL", city: "Rotterdam", address: "Schiekade 55", zipCode: "3032AD", lat: 51.9247, lng: 4.4747, rentPrice: 1200000, surfaceTotal: 600, buildYear: 1975, seatingCapacityInside: 40, seatingCapacityOutside: 0, images: IMAGES.hotel },
  { title: "Snackbar Blaak", slug: "snackbar-blaak", description: "Compacte snackbar op drukke locatie bij station Blaak. Frituur en toonbank aanwezig. Ideaal voor Hollandse snacks of Surinaams concept.", propertyType: "SNACKBAR", city: "Rotterdam", address: "Blaak 16", zipCode: "3011TA", lat: 51.9195, lng: 4.4887, rentPrice: 180000, surfaceTotal: 45, buildYear: 1988, seatingCapacityInside: 10, seatingCapacityOutside: 0, images: IMAGES.restaurant },
  { title: "Wijnbar Katendrecht", slug: "wijnbar-katendrecht", description: "Intiem pand op trendy Katendrecht. Ideaal voor een wijnbar of tapas concept. Sfeervolle buurt met veel horeca.", propertyType: "BAR", city: "Rotterdam", address: "Delistraat 15", zipCode: "3072ZH", lat: 51.9005, lng: 4.4870, rentPrice: 290000, surfaceTotal: 70, buildYear: 1940, seatingCapacityInside: 30, seatingCapacityOutside: 12, images: IMAGES.bar },

  // Utrecht (6)
  { title: "Terrasrestaurant Oudegracht", slug: "terrasrestaurant-oudegracht", description: "Iconische werfkelder aan de Oudegracht met uniek terras op het water. Monumentaal pand met gewelfd plafond. Een van de mooiste horecalocaties van Utrecht.", propertyType: "RESTAURANT", city: "Utrecht", address: "Oudegracht 172", zipCode: "3511NP", lat: 52.0883, lng: 5.1200, rentPrice: 620000, surfaceTotal: 140, buildYear: 1350, seatingCapacityInside: 50, seatingCapacityOutside: 35, images: IMAGES.restaurant },
  { title: "Brouwerij Café Lombok", slug: "brouwerij-cafe-lombok", description: "Ruim pand in multiculturele wijk Lombok. Geschikt voor brouwerij/taproom concept. Hoge plafonds, industriële uitstraling. Eigen brouwinstallatie mogelijk.", propertyType: "CAFE", city: "Utrecht", address: "Kanaalstraat 85", zipCode: "3531CJ", lat: 52.0883, lng: 5.0987, rentPrice: 350000, surfaceTotal: 180, buildYear: 1920, seatingCapacityInside: 70, seatingCapacityOutside: 25, images: IMAGES.cafe },
  { title: "Bakkerij-Café Neude", slug: "bakkerij-cafe-neude", description: "Hoekpand bij de Neude, ideaal voor een bakkerij met zitgedeelte. Ochtend- en lunchconcept. Hoge passantenstromen.", propertyType: "BAKERY", city: "Utrecht", address: "Neude 11", zipCode: "3512AD", lat: 52.0916, lng: 5.1185, rentPrice: 420000, surfaceTotal: 100, buildYear: 1880, seatingCapacityInside: 30, seatingCapacityOutside: 12, images: IMAGES.lunchroom },
  { title: "Thai Restaurant Twijnstraat", slug: "thai-restaurant-twijnstraat", description: "Sfeervol pand aan het einde van de Twijnstraat. Volledig ingerichte Aziatische keuken met wok-installatie en afzuiging.", propertyType: "RESTAURANT", city: "Utrecht", address: "Twijnstraat 48", zipCode: "3511ZL", lat: 52.0865, lng: 5.1234, rentPrice: 380000, surfaceTotal: 110, buildYear: 1900, seatingCapacityInside: 45, seatingCapacityOutside: 0, images: IMAGES.restaurant },
  { title: "Lunchroom Stationsgebied", slug: "lunchroom-stationsgebied-utrecht", description: "Modern pand in het vernieuwde Stationsgebied. Ideaal voor health food of juice bar concept. Veel kantoorpersoneel in de buurt.", propertyType: "LUNCHROOM", city: "Utrecht", address: "Catharijnesingel 40", zipCode: "3511GC", lat: 52.0900, lng: 5.1100, rentPrice: 340000, surfaceTotal: 80, buildYear: 2018, seatingCapacityInside: 35, seatingCapacityOutside: 10, images: IMAGES.lunchroom },
  { title: "IJssalon Vredenburg", slug: "ijssalon-vredenburg", description: "Klein maar strategisch gelegen pand bij Vredenburg. Perfect voor ambachtelijk ijs of frozen yoghurt. Seizoensafhankelijk maar hoge omzet in zomer.", propertyType: "CAFE", city: "Utrecht", address: "Vredenburg 5", zipCode: "3511BA", lat: 52.0925, lng: 5.1150, rentPrice: 220000, surfaceTotal: 40, buildYear: 1965, seatingCapacityInside: 10, seatingCapacityOutside: 8, images: IMAGES.lunchroom },

  // Den Haag (5)
  { title: "Strandtent Scheveningen", slug: "strandtent-scheveningen", description: "Iconische strandlocatie op Scheveningen. Seizoensconcept (april-oktober) met mogelijkheid tot winterpaviljoen. Ongeëvenaard uitzicht op zee.", propertyType: "RESTAURANT", city: "Den Haag", address: "Strandweg 1", zipCode: "2586JK", lat: 52.1070, lng: 4.2700, rentPrice: 480000, surfaceTotal: 250, buildYear: 2010, seatingCapacityInside: 80, seatingCapacityOutside: 150, images: IMAGES.restaurant },
  { title: "Brasserie Plein", slug: "brasserie-plein-den-haag", description: "Prominente locatie aan Het Plein, hart van politiek Den Haag. Brasserie met groot terras. Veelvuldig bezocht door professionals en toeristen.", propertyType: "RESTAURANT", city: "Den Haag", address: "Het Plein 28", zipCode: "2511CS", lat: 52.0780, lng: 4.3130, rentPrice: 680000, surfaceTotal: 170, buildYear: 1870, seatingCapacityInside: 65, seatingCapacityOutside: 40, images: IMAGES.restaurant },
  { title: "Café Dunne Bierkade", slug: "cafe-dunne-bierkade", description: "Gezellig café aan de grachten van Den Haag. Bruine kroeg sfeer met mogelijkheid tot modernisering. Trouwe buurtklanten.", propertyType: "CAFE", city: "Den Haag", address: "Dunne Bierkade 4", zipCode: "2512BC", lat: 52.0792, lng: 4.3085, rentPrice: 280000, surfaceTotal: 80, buildYear: 1915, seatingCapacityInside: 35, seatingCapacityOutside: 16, images: IMAGES.cafe },
  { title: "Hotel Kurhaus", slug: "hotel-kurhaus-omgeving", description: "Voormalig pension nabij het Kurhaus, geschikt voor B&B of klein hotel. 8 kamers, ontbijtruimte, tuin. Strand op loopafstand.", propertyType: "HOTEL", city: "Den Haag", address: "Gevers Deynootweg 80", zipCode: "2586BN", lat: 52.1100, lng: 4.2795, rentPrice: 880000, surfaceTotal: 320, buildYear: 1920, seatingCapacityInside: 20, seatingCapacityOutside: 15, images: IMAGES.hotel },
  { title: "Poké Bowl Bar Chinatown", slug: "poke-bowl-bar-chinatown", description: "Compact pand in Chinatown/centrum. Ideaal voor poké, ramen of Aziatisch streetfood. Moderne uitstraling, kant-en-klare keuken.", propertyType: "RESTAURANT", city: "Den Haag", address: "Wagenstraat 168", zipCode: "2512AX", lat: 52.0785, lng: 4.3230, rentPrice: 290000, surfaceTotal: 65, buildYear: 1950, seatingCapacityInside: 25, seatingCapacityOutside: 0, images: IMAGES.restaurant },

  // Eindhoven (4)
  { title: "Restaurant Strijp-S", slug: "restaurant-strijp-s-eindhoven", description: "Industrieel pand op creatieve hotspot Strijp-S. Voormalige Philips-fabriek, loft-achtige ruimte met enorm hoge plafonds. Perfecte basis voor een culinair concept.", propertyType: "RESTAURANT", city: "Eindhoven", address: "Torenallee 22", zipCode: "5617BC", lat: 51.4490, lng: 5.4540, rentPrice: 450000, surfaceTotal: 220, buildYear: 1930, seatingCapacityInside: 90, seatingCapacityOutside: 30, images: IMAGES.restaurant },
  { title: "Café Stratumseind", slug: "cafe-stratumseind-eindhoven", description: "Locatie aan Europa's langste kroegstraat. Bewezen horecalocatie met hoge omzetpotentie. Ideaal voor studentenpubliek en nachtleven.", propertyType: "CAFE", city: "Eindhoven", address: "Stratumseind 44", zipCode: "5611EN", lat: 51.4370, lng: 5.4800, rentPrice: 320000, surfaceTotal: 130, buildYear: 1960, seatingCapacityInside: 60, seatingCapacityOutside: 20, images: IMAGES.bar },
  { title: "Koffiebar Design District", slug: "koffiebar-design-district-eindhoven", description: "Moderne ruimte in het Design District. Ideaal voor specialty coffee met een design-inslag. Veel creatieve professionals in de buurt.", propertyType: "KOFFIEBAR", city: "Eindhoven", address: "Vestdijk 25", zipCode: "5611CA", lat: 51.4370, lng: 5.4760, rentPrice: 260000, surfaceTotal: 65, buildYear: 2005, seatingCapacityInside: 25, seatingCapacityOutside: 10, images: IMAGES.lunchroom },
  { title: "Eetcafé Woenselse Markt", slug: "eetcafe-woenselse-markt", description: "Gezellig eetcafé bij de Woenselse Markt. Buurtgericht concept, vaste klantenkring. Keuken en inventaris inbegrepen bij overname.", propertyType: "EETCAFE", city: "Eindhoven", address: "Woenselse Markt 10", zipCode: "5612CS", lat: 51.4520, lng: 5.4790, rentPrice: 220000, surfaceTotal: 110, buildYear: 1975, seatingCapacityInside: 50, seatingCapacityOutside: 15, images: IMAGES.cafe },

  // Groningen (3)
  { title: "Grand Café Grote Markt", slug: "grand-cafe-grote-markt-groningen", description: "Prominent pand aan de Grote Markt van Groningen. Groot terras met uitzicht op de Martinitoren. Studentenstad met levendige horecascene.", propertyType: "GRAND_CAFE", city: "Groningen", address: "Grote Markt 22", zipCode: "9711LV", lat: 53.2194, lng: 6.5665, rentPrice: 380000, surfaceTotal: 200, buildYear: 1880, seatingCapacityInside: 80, seatingCapacityOutside: 50, images: IMAGES.cafe },
  { title: "Studentenbar Peperstraat", slug: "studentenbar-peperstraat", description: "Populaire locatie in het uitgaansgebied. Studentenvriendelijk concept met lage drempel. Geluidsinstallatie en DJ-booth aanwezig.", propertyType: "BAR", city: "Groningen", address: "Peperstraat 16", zipCode: "9711PB", lat: 53.2185, lng: 6.5710, rentPrice: 250000, surfaceTotal: 150, buildYear: 1965, seatingCapacityInside: 100, seatingCapacityOutside: 0, images: IMAGES.bar },
  { title: "Vegetarisch Restaurant Noorderplantsoen", slug: "vegetarisch-restaurant-noorderplantsoen", description: "Rustig gelegen pand bij het Noorderplantsoen. Ideaal voor een plantaardig restaurant of healing food concept. Tuin beschikbaar.", propertyType: "RESTAURANT", city: "Groningen", address: "Nieuwe Boteringestraat 55", zipCode: "9712PL", lat: 53.2240, lng: 6.5640, rentPrice: 320000, surfaceTotal: 100, buildYear: 1910, seatingCapacityInside: 40, seatingCapacityOutside: 20, images: IMAGES.restaurant },

  // Maastricht (3)
  { title: "Restaurant Vrijthof", slug: "restaurant-vrijthof-maastricht", description: "Toplocatie aan het Vrijthof, Maastricht's bekendste plein. Internationaal publiek, Bourgondische sfeer. Terras op het plein.", propertyType: "RESTAURANT", city: "Maastricht", address: "Vrijthof 15", zipCode: "6211LE", lat: 50.8492, lng: 5.6890, rentPrice: 580000, surfaceTotal: 160, buildYear: 1850, seatingCapacityInside: 60, seatingCapacityOutside: 40, images: IMAGES.restaurant },
  { title: "Wijnbar Jekerkwartier", slug: "wijnbar-jekerkwartier", description: "Sfeervol pand in het pittoreske Jekerkwartier. Klein maar exclusief. Ideaal voor een wijnbar met kleine gerechten.", propertyType: "BAR", city: "Maastricht", address: "Grote Gracht 80", zipCode: "6211SX", lat: 50.8465, lng: 5.6845, rentPrice: 240000, surfaceTotal: 60, buildYear: 1890, seatingCapacityInside: 25, seatingCapacityOutside: 8, images: IMAGES.bar },
  { title: "Pannenkoekenhuis Wyck", slug: "pannenkoekenhuis-wyck", description: "Familievriendelijk pand in Wyck met doorloop naar terras. Geschikt voor pannenkoekenhuis, crêperie of familierestaurant. Nabij station.", propertyType: "RESTAURANT", city: "Maastricht", address: "Rechtstraat 42", zipCode: "6221EH", lat: 50.8470, lng: 5.6960, rentPrice: 310000, surfaceTotal: 130, buildYear: 1935, seatingCapacityInside: 55, seatingCapacityOutside: 20, images: IMAGES.restaurant },

  // Overige steden (6)
  { title: "Strandpaviljoen Zandvoort", slug: "strandpaviljoen-zandvoort", description: "Direct aan het strand van Zandvoort. Groot terras, keuken, bar. Seizoensbedrijf april-oktober met mogelijkheid tot winterexploitatie.", propertyType: "RESTAURANT", city: "Zandvoort", address: "Boulevard Barnaart 1", zipCode: "2041JA", lat: 52.3729, lng: 4.5303, rentPrice: 520000, surfaceTotal: 300, buildYear: 2012, seatingCapacityInside: 100, seatingCapacityOutside: 200, images: IMAGES.restaurant },
  { title: "Bierbrouwerij Haarlem", slug: "bierbrouwerij-haarlem", description: "Voormalig pakhuis in historisch Haarlem. Ideaal voor ambachtelijke brouwerij met proeflokaal. Hoge plafonds, authentieke uitstraling.", propertyType: "CAFE", city: "Haarlem", address: "Spaarne 59", zipCode: "2011CG", lat: 52.3814, lng: 4.6387, rentPrice: 440000, surfaceTotal: 250, buildYear: 1870, seatingCapacityInside: 70, seatingCapacityOutside: 25, images: IMAGES.cafe },
  { title: "Tapas Bar Breda", slug: "tapas-bar-breda", description: "Intieme locatie in het centrum van Breda. Perfecte setting voor een tapas bar of mediterraan concept. Gezellige binnenplaats.", propertyType: "BAR", city: "Breda", address: "Haven 5", zipCode: "4811WH", lat: 51.5882, lng: 4.7756, rentPrice: 280000, surfaceTotal: 85, buildYear: 1925, seatingCapacityInside: 35, seatingCapacityOutside: 20, images: IMAGES.bar },
  { title: "Restaurant Overijssel Deventer", slug: "restaurant-overijssel-deventer", description: "Monumentaal pand aan de IJssel in Deventer. Ruim terras aan het water. Ideale setting voor een seizoensgebonden rivierrestaurant.", propertyType: "RESTAURANT", city: "Deventer", address: "Brink 55", zipCode: "7411BT", lat: 52.2550, lng: 6.1600, rentPrice: 320000, surfaceTotal: 140, buildYear: 1600, seatingCapacityInside: 55, seatingCapacityOutside: 30, images: IMAGES.restaurant },
  { title: "Café De Drie Gezusters Arnhem", slug: "cafe-drie-gezusters-arnhem", description: "Groot café aan het Korenmarkt in Arnhem. Meerdere ruimtes, podium voor live muziek. Populair bij studenten en young professionals.", propertyType: "CAFE", city: "Arnhem", address: "Korenmarkt 10", zipCode: "6811GV", lat: 51.9849, lng: 5.9080, rentPrice: 350000, surfaceTotal: 220, buildYear: 1920, seatingCapacityInside: 120, seatingCapacityOutside: 40, images: IMAGES.cafe },
  { title: "Lunchroom Tilburg Piusplein", slug: "lunchroom-tilburg-piusplein", description: "Modern pand bij het Piusplein. Lunchroom met bakconcept. Veel studenten en shoppers. Redelijke huur voor centrumlocatie.", propertyType: "LUNCHROOM", city: "Tilburg", address: "Piusplein 8", zipCode: "5038WL", lat: 51.5593, lng: 5.0854, rentPrice: 240000, surfaceTotal: 90, buildYear: 1990, seatingCapacityInside: 40, seatingCapacityOutside: 15, images: IMAGES.lunchroom },
];

async function main() {
  console.log("🌱 Seeding extra properties...\n");

  // Find or create a test agency + user
  let agency = await prisma.agency.findFirst();
  let userId: string;

  if (!agency) {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("No user found. Run main seed first: bun prisma/seed.ts");
      process.exit(1);
    }
    userId = user.id;
    agency = await prisma.agency.create({
      data: {
        name: "Horecagrond Demo Makelaardij",
        slug: "horecagrond-demo",
        email: "info@horecagrond-demo.nl",
        phone: "+31201234567",
        city: "Amsterdam",
      },
    });
  } else {
    const user = await prisma.user.findFirst();
    userId = user!.id;
  }

  let created = 0;
  for (const prop of EXTRA_PROPERTIES) {
    // Skip if slug exists
    const exists = await prisma.property.findUnique({ where: { slug: prop.slug } });
    if (exists) {
      console.log(`  ⏭️  ${prop.slug} (exists)`);
      continue;
    }

    await prisma.property.create({
      data: {
        title: prop.title,
        slug: prop.slug,
        description: prop.description,
        propertyType: prop.propertyType as any,
        status: "ACTIVE",
        city: prop.city,
        address: prop.address,
        postalCode: prop.zipCode,
        priceType: "RENT" as any,
        latitude: prop.lat,
        longitude: prop.lng,
        rentPrice: prop.rentPrice,
        surfaceTotal: prop.surfaceTotal,
        buildYear: prop.buildYear,
        seatingCapacityInside: prop.seatingCapacityInside,
        seatingCapacityOutside: prop.seatingCapacityOutside,
        totalCapacity: prop.seatingCapacityInside + prop.seatingCapacityOutside,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdById: userId,
        agencyId: agency.id,
        // Create images separately due to Prisma 7 enum handling
      },
    });
    // Add images separately
    const createdProp = await prisma.property.findUnique({ where: { slug: prop.slug } });
    if (createdProp) {
      for (let i = 0; i < prop.images.length; i++) {
        await prisma.propertyImage.create({
          data: {
            propertyId: createdProp.id,
            originalUrl: prop.images[i],
            order: i,
          },
        });
      }
    }
    created++;
    console.log(`  ✅ ${prop.title} (${prop.city})`);
  }

  console.log(`\n🎉 Created ${created} new properties!`);
  console.log(`📊 Total: ${await prisma.property.count()} properties in database`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

/**
 * Países por continente (ISO 3166 alfa-3), cada país em um só continente. Rússia, Turquia e Chipre ficam
 * na Europa; o Cáucaso (Armênia, Azerbaijão, Geórgia) na Ásia; América Central e Caribe na América do Norte.
 * `frame` é o recorte [oeste, sul, leste, norte] usado para desenhar o continente no selo.
 */
export const CONTINENTS = {
  europa: {
    name: 'Europa',
    frame: [-11, 35, 40, 71],
    countries: 'ALB AND AUT BEL BGR BIH BLR CHE CYP CZE DEU DNK ESP EST FIN FRA GBR GRC HRV HUN IRL ISL ITA LIE LTU LUX LVA MCO MDA MKD MLT MNE NLD NOR POL PRT ROU RUS SMR SRB SVK SVN SWE TUR UKR VAT',
  },
  africa: {
    name: 'África',
    frame: [-20, -36, 52, 38],
    countries: 'DZA AGO BEN BWA BFA BDI CPV CMR CAF TCD COM COG COD CIV DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE',
  },
  asia: {
    name: 'Ásia',
    frame: [25, -11, 150, 56],
    countries: 'AFG ARM AZE BHR BGD BTN BRN KHM CHN GEO IND IDN IRN IRQ ISR JPN JOR KAZ KWT KGZ LAO LBN MYS MDV MNG MMR NPL PRK OMN PAK PSE PHL QAT SAU SGP KOR LKA SYR TWN TJK THA TLS TKM ARE UZB VNM YEM',
  },
  americaSul: {
    name: 'América do Sul',
    frame: [-82, -56, -34, 13],
    countries: 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN',
  },
  americaNorte: {
    name: 'América do Norte e Central',
    frame: [-170, 7, -52, 72],
    countries: 'ATG BHS BRB BLZ CAN CRI CUB DMA DOM SLV GRD GTM HTI HND JAM MEX NIC PAN KNA LCA VCT TTO USA',
  },
  oceania: {
    name: 'Oceania',
    frame: [110, -48, 180, 0],
    countries: 'AUS FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT',
  },
} as const;

export type ContinentId = keyof typeof CONTINENTS;
export const CONTINENT_IDS = Object.keys(CONTINENTS) as ContinentId[];

const sets = Object.fromEntries(CONTINENT_IDS.map((id) => [id, new Set(CONTINENTS[id].countries.split(' '))])) as Record<ContinentId, Set<string>>;

export const continentCountries = (id: ContinentId): Set<string> => sets[id];
export const continentOf = (a3: string): ContinentId | null => CONTINENT_IDS.find((id) => sets[id].has(a3)) ?? null;
/** Todos os países do mundo considerados pelos selos (196). */
export const ALL_COUNTRIES: Set<string> = new Set(CONTINENT_IDS.flatMap((id) => [...sets[id]]));

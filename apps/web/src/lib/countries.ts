/**
 * Country code utilities for the frontend.
 *
 * ISO 3166-1 alpha-2 to full country name mapping.
 * Synchronized with apps/api/src/utils/countries.py
 */

export interface Country {
  value: string; // ISO code
  label: string; // Full country name
}

export const COUNTRIES: Country[] = [
  // A
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AO", label: "Angola" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  // B
  { value: "BS", label: "Bahamas, The" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BM", label: "Bermuda" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BR", label: "Brazil" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "MM", label: "Burma" },
  // C
  { value: "KH", label: "Cambodia" },
  { value: "CA", label: "Canada" },
  { value: "KY", label: "Cayman Islands" },
  { value: "CF", label: "Central African Republic" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CD", label: "Congo, Democratic Republic of the" },
  { value: "CG", label: "Congo, Republic of the" },
  { value: "CR", label: "Costa Rica" },
  { value: "CI", label: "Cote d Ivoire" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  // D
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  // E
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "ET", label: "Ethiopia" },
  // F
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  // G
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GI", label: "Gibraltar" },
  { value: "GR", label: "Greece" },
  { value: "GT", label: "Guatemala" },
  { value: "GG", label: "Guernsey" },
  { value: "GN", label: "Guinea" },
  { value: "GY", label: "Guyana" },
  // H
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  // I
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  // J
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JE", label: "Jersey" },
  { value: "JO", label: "Jordan" },
  // K
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KP", label: "Korea, North" },
  { value: "KR", label: "Korea, South" },
  { value: "XK", label: "Kosovo" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  // L
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  // M
  { value: "MO", label: "Macau" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "IM", label: "Man, Isle of" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  // N
  { value: "NA", label: "Namibia" },
  { value: "NL", label: "Netherlands" },
  { value: "AN", label: "Netherlands Antilles" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NG", label: "Nigeria" },
  { value: "MK", label: "North Macedonia, The Republic of" },
  { value: "NO", label: "Norway" },
  // O
  { value: "OM", label: "Oman" },
  // P
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PS", label: "Palestinian" },
  { value: "PA", label: "Panama" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  // Q
  { value: "QA", label: "Qatar" },
  // R
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "RW", label: "Rwanda" },
  // S
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "SM", label: "San Marino" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  // T
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "GM", label: "The Gambia" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  // U
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  // V
  { value: "VU", label: "Vanuatu" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "VG", label: "Virgin Islands, British" },
  // W
  { value: "EH", label: "West Bank" },
  // Y
  { value: "YE", label: "Yemen" },
  // Z
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];

// For reverse lookup if needed
export const ISO_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.value, c.label])
);

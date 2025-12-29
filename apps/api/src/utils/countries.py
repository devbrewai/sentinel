"""
Country code utilities for sanctions screening.

This module provides ISO 3166-1 alpha-2 country code to full name mappings
for compatibility with the OFAC sanctions database which uses full country names.
"""

from typing import Optional

# ISO 3166-1 alpha-2 to full country name mapping
# Names match the OFAC sanctions database format in data_catalog/processed/sanctions_names.csv
ISO_TO_COUNTRY: dict[str, str] = {
    # A
    "AF": "Afghanistan",
    "AL": "Albania",
    "DZ": "Algeria",
    "AO": "Angola",
    "AG": "Antigua and Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    # B
    "BS": "Bahamas, The",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BO": "Bolivia",
    "BA": "Bosnia and Herzegovina",
    "BR": "Brazil",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "MM": "Burma",
    # C
    "KH": "Cambodia",
    "CA": "Canada",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "CL": "Chile",
    "CN": "China",
    "CO": "Colombia",
    "KM": "Comoros",
    "CD": "Congo, Democratic Republic of the",
    "CG": "Congo, Republic of the",
    "CR": "Costa Rica",
    "CI": "Cote d Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    # D
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    # E
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "ET": "Ethiopia",
    # F
    "FI": "Finland",
    "FR": "France",
    # G
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GR": "Greece",
    "GT": "Guatemala",
    "GG": "Guernsey",
    "GN": "Guinea",
    "GY": "Guyana",
    # H
    "HT": "Haiti",
    "HN": "Honduras",
    "HK": "Hong Kong",
    "HU": "Hungary",
    # I
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IL": "Israel",
    "IT": "Italy",
    # J
    "JM": "Jamaica",
    "JP": "Japan",
    "JE": "Jersey",
    "JO": "Jordan",
    # K
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KP": "Korea, North",
    "KR": "Korea, South",
    "XK": "Kosovo",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    # L
    "LA": "Laos",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LR": "Liberia",
    "LY": "Libya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    # M
    "MO": "Macau",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "IM": "Man, Isle of",
    "MH": "Marshall Islands",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "MX": "Mexico",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MA": "Morocco",
    "MZ": "Mozambique",
    # N
    "NA": "Namibia",
    "NL": "Netherlands",
    "AN": "Netherlands Antilles",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NG": "Nigeria",
    "MK": "North Macedonia, The Republic of",
    "NO": "Norway",
    # O
    "OM": "Oman",
    # P
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "Palestinian",
    "PA": "Panama",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PL": "Poland",
    # Q
    "QA": "Qatar",
    # R
    "RO": "Romania",
    "RU": "Russia",
    "RW": "Rwanda",
    # S
    "KN": "Saint Kitts and Nevis",
    "VC": "Saint Vincent and the Grenadines",
    "SM": "San Marino",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SO": "Somalia",
    "ZA": "South Africa",
    "SS": "South Sudan",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syria",
    # T
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "GM": "The Gambia",
    "TT": "Trinidad and Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    # U
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    # V
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Vietnam",
    "VG": "Virgin Islands, British",
    # W
    "EH": "West Bank",
    # Y
    "YE": "Yemen",
    # Z
    "ZM": "Zambia",
    "ZW": "Zimbabwe",
}


def iso_to_country_name(iso_code: Optional[str]) -> Optional[str]:
    """
    Convert ISO 3166-1 alpha-2 country code to full country name.

    This is needed because the OFAC sanctions database uses full country names
    (e.g., "Lebanon") while API inputs typically use ISO codes (e.g., "LB").

    Args:
        iso_code: ISO 3166-1 alpha-2 country code (e.g., "US", "LB", "RU")

    Returns:
        Full country name matching OFAC format, or the original code if not found.
        Returns None if input is None.

    Examples:
        >>> iso_to_country_name("LB")
        'Lebanon'
        >>> iso_to_country_name("US")
        'United States'
        >>> iso_to_country_name(None)
        None
    """
    if not iso_code:
        return None
    return ISO_TO_COUNTRY.get(iso_code.upper(), iso_code)

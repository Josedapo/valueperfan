#!/usr/bin/env python3
"""
Audit country assignments for all accounts in ValuePerFan.

Detects:
1. Accounts with a wrong country assigned (mismatch)
2. Accounts without country that should have one

Generates a single proposal document grouped by confidence level.
Excludes known exceptions (validated manually in previous audits).

Usage: python3 scripts/audit-countries.py [--month YYYY-MM]
"""

import json
import re
import os
import sys
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..')
VPF_ROOT = os.path.join(PROJECT_ROOT, '..')
ACCOUNTS_PATH = os.path.join(PROJECT_ROOT, 'src', 'data', 'accounts.json')
EXCEPTIONS_PATH = os.path.join(VPF_ROOT, 'Country Audits', 'known-exceptions.json')
AUDITS_DIR = os.path.join(VPF_ROOT, 'Country Audits')

# --- Country reference data ---

TLD_TO_COUNTRY = {
    'ar': 'Argentina', 'at': 'Austria', 'au': 'Australia', 'az': 'Azerbaijan',
    'ba': 'Bosnia and Herzegovina', 'be': 'Belgium', 'bg': 'Bulgaria',
    'br': 'Brazil', 'by': 'Belarus', 'ca': 'Canada', 'ch': 'Switzerland',
    'cl': 'Chile', 'cn': 'China', 'co': 'Colombia', 'cr': 'Costa Rica',
    'cz': 'Czech Republic', 'de': 'Germany', 'dk': 'Denmark',
    'do': 'Dominican Republic', 'dz': 'Algeria', 'ec': 'Ecuador',
    'ee': 'Estonia', 'eg': 'Egypt', 'es': 'Spain', 'fi': 'Finland',
    'fr': 'France', 'ge': 'Georgia', 'gh': 'Ghana', 'gr': 'Greece',
    'gt': 'Guatemala', 'hk': 'Hong Kong', 'hn': 'Honduras', 'hr': 'Croatia',
    'hu': 'Hungary', 'id': 'Indonesia', 'ie': 'Ireland', 'il': 'Israel',
    'in': 'India', 'ir': 'Iran', 'is': 'Iceland', 'it': 'Italy',
    'jm': 'Jamaica', 'jp': 'Japan', 'ke': 'Kenya', 'kr': 'South Korea',
    'kz': 'Kazakhstan', 'lt': 'Lithuania', 'lu': 'Luxembourg', 'lv': 'Latvia',
    'ma': 'Morocco', 'me': 'Montenegro', 'mk': 'North Macedonia',
    'mx': 'Mexico', 'my': 'Malaysia', 'ng': 'Nigeria', 'nl': 'Netherlands',
    'no': 'Norway', 'nz': 'New Zealand', 'pa': 'Panama', 'pe': 'Peru',
    'ph': 'Philippines', 'pk': 'Pakistan', 'pl': 'Poland', 'pr': 'Puerto Rico',
    'pt': 'Portugal', 'py': 'Paraguay', 'qa': 'Qatar', 'ro': 'Romania',
    'rs': 'Serbia', 'ru': 'Russia', 'sa': 'Saudi Arabia', 'se': 'Sweden',
    'sg': 'Singapore', 'si': 'Slovenia', 'sk': 'Slovakia', 'sn': 'Senegal',
    'sv': 'El Salvador', 'th': 'Thailand', 'tn': 'Tunisia', 'tr': 'Turkey',
    'tw': 'Taiwan', 'ua': 'Ukraine', 'ug': 'Uganda', 'us': 'United States',
    'uy': 'Uruguay', 've': 'Venezuela', 'vn': 'Vietnam', 'za': 'South Africa',
}

CODE_TO_COUNTRY = {k.upper(): v for k, v in TLD_TO_COUNTRY.items()}
CODE_TO_COUNTRY.update({
    'GB': 'United Kingdom', 'UK': 'United Kingdom',
    'AE': 'United Arab Emirates',
})

COUNTRY_NAMES = {
    'United States': ['united states', 'usa', 'u.s.a'],
    'United Kingdom': ['united kingdom'],
    'Brazil': ['brazil', 'brasil'],
    'France': ['france'],
    'Spain': ['spain', 'españa', 'espana'],
    'Germany': ['germany', 'deutschland'],
    'Italy': ['italy', 'italia'],
    'India': ['india'],
    'Australia': ['australia'],
    'Portugal': ['portugal'],
    'Mexico': ['mexico', 'méxico'],
    'Argentina': ['argentina'],
    'Netherlands': ['netherlands', 'nederland'],
    'Japan': ['japan'],
    'Poland': ['poland', 'polska'],
    'Canada': ['canada'],
    'Czech Republic': ['czech republic', 'czech', 'česk', 'cesk'],
    'Belgium': ['belgium', 'belgique', 'belgië'],
    'South Africa': ['south africa'],
    'Turkey': ['turkey', 'türkiye', 'turkiye'],
    'Russia': ['russia'],
    'Sweden': ['sweden', 'sverige'],
    'Norway': ['norway', 'norge'],
    'Denmark': ['denmark', 'danmark'],
    'Finland': ['finland', 'suomi'],
    'Austria': ['austria', 'österreich'],
    'Switzerland': ['switzerland', 'schweiz', 'suisse', 'svizzera'],
    'Ireland': ['ireland'],
    'Romania': ['romania'],
    'Croatia': ['croatia', 'hrvatska'],
    'Serbia': ['serbia', 'srbija'],
    'Hungary': ['hungary', 'magyarország'],
    'Ukraine': ['ukraine', 'україна'],
    'Greece': ['greece', 'hellas'],
    'Bulgaria': ['bulgaria'],
    'Slovakia': ['slovakia', 'slovensko'],
    'Slovenia': ['slovenia', 'slovenija'],
    'South Korea': ['south korea', 'korea'],
    'China': ['china'],
    'Thailand': ['thailand'],
    'Indonesia': ['indonesia'],
    'Malaysia': ['malaysia'],
    'Philippines': ['philippines'],
    'Vietnam': ['vietnam'],
    'Singapore': ['singapore'],
    'Pakistan': ['pakistan'],
    'Bangladesh': ['bangladesh'],
    'Colombia': ['colombia'],
    'Chile': ['chile'],
    'Peru': ['peru', 'perú'],
    'Ecuador': ['ecuador'],
    'Paraguay': ['paraguay'],
    'Uruguay': ['uruguay'],
    'Venezuela': ['venezuela'],
    'Nigeria': ['nigeria'],
    'Ghana': ['ghana'],
    'Kenya': ['kenya'],
    'Egypt': ['egypt'],
    'Morocco': ['morocco'],
    'Israel': ['israel'],
    'Iran': ['iran'],
    'Saudi Arabia': ['saudi arabia', 'saudi'],
    'Qatar': ['qatar'],
    'United Arab Emirates': ['uae'],
    'New Zealand': ['new zealand'],
    'Jamaica': ['jamaica'],
    'Scotland': ['scotland'],
    'Wales': ['wales', 'cymru'],
    'Nepal': ['nepal'],
    'Taiwan': ['taiwan'],
    'Hong Kong': ['hong kong'],
    'Iceland': ['iceland', 'ísland'],
    'Albania': ['albania'],
    'Montenegro': ['montenegro'],
    'North Macedonia': ['north macedonia', 'macedonia'],
    'Kosovo': ['kosovo'],
    'Bosnia and Herzegovina': ['bosnia'],
    'Moldova': ['moldova'],
    'Latvia': ['latvia'],
    'Lithuania': ['lithuania'],
    'Estonia': ['estonia'],
    'Belarus': ['belarus'],
    'Georgia': ['georgia'],
    'Armenia': ['armenia'],
    'Azerbaijan': ['azerbaijan'],
    'Kazakhstan': ['kazakhstan'],
    'Uzbekistan': ['uzbekistan'],
    'Costa Rica': ['costa rica'],
    'Panama': ['panama', 'panamá'],
    'Honduras': ['honduras'],
    'El Salvador': ['el salvador'],
    'Guatemala': ['guatemala'],
    'Bolivia': ['bolivia'],
    'Algeria': ['algeria'],
    'Tunisia': ['tunisia'],
    'Senegal': ['senegal'],
    'Cameroon': ['cameroon'],
    'Ivory Coast': ['ivory coast', "côte d'ivoire"],
    'Tanzania': ['tanzania'],
    'Uganda': ['uganda'],
    'Ethiopia': ['ethiopia'],
    'Andorra': ['andorra'],
    'Monaco': ['monaco'],
    'Luxembourg': ['luxembourg'],
    'Cyprus': ['cyprus'],
    'Malta': ['malta'],
    'Bahrain': ['bahrain'],
    'Kuwait': ['kuwait'],
    'Oman': ['oman'],
    'Sri Lanka': ['sri lanka'],
    'Myanmar': ['myanmar'],
    'Cambodia': ['cambodia'],
}

EQUIVALENT_COUNTRIES = [
    {'England', 'Scotland', 'Wales', 'United Kingdom', 'Northern Ireland'},
    {'Hong Kong', 'China'},
    {'Taiwan', 'China'},
]

# --- Known false positive patterns in display names ---
FALSE_POSITIVE_NAME_PATTERNS = [
    r'Francesco', r'Francesca', r'Francis\b', r'Franklin', r'Franck\b', r'Franco\b',
    r'Indiana\b', r'India[np]', r'Indianapolis',
    r'Georgia\s+(Tech|State|Bulldogs|Stanway|Southern)',
    r'\bGeorgia\b.*\b(Stanway|Toffolo|Hall|Wilson)\b',
    r'Perugia', r'Perugino',
    r'Jordan\b',
    r'Chad\s', r'\bChad\b.*\b(Johnson|Smith|Green|Reed)\b',
    r'Mali[ck]',
    r'Niger[^i]',
    r'Guinea',
    r'Iran[^i\s]', r'Miran',
    r'Hellas\s+Verona',
    r'Borussia',
    r'Alba\s+Berlin',
    r'\bAlba\b(?!nia)',
    r'Albacete',
    r'Emirates\s+(Team|Great Britain|GBR)',
    r'[Ll]ukaku', r'[Ll]uk[aáeé]\b', r'[Ll]ukas\b', r'[Dd]uk[le]',
    r'[Ss]uzuk[ai]', r'[Ff]ukuo?ka', r'[Ss]hinsuke', r'[Ss]hinnosuke',
    r'[Kk]azuki', r'[Yy]usuke', r'[Dd]aisuke', r'[Kk]osuke', r'[Kk]eisuke',
    r'Nusantara', r'Busaiteen', r'SoftBank',
    r'Lausanne', r'Crusader', r'Jerusalem',
    r'USAM\b', r'\bUS\s+Montalban',
    r'Portugal\.\s+The\s+Man',
    r'Toulousain',
    r'Northern\s+Ireland',
]

_FP_COMPILED = [re.compile(p, re.IGNORECASE) for p in FALSE_POSITIVE_NAME_PATTERNS]


def countries_equivalent(c1, c2):
    if c1 is None or c2 is None:
        return False
    if c1 == c2:
        return True
    for group in EQUIVALENT_COUNTRIES:
        if c1 in group and c2 in group:
            return True
    return False


def is_false_positive_name(name, variant, country_match_obj):
    for fp_re in _FP_COMPILED:
        fp_match = fp_re.search(name)
        if fp_match:
            if (country_match_obj.start() < fp_match.end() and
                country_match_obj.end() > fp_match.start()):
                return True
    return False


def platform_label(platform):
    return 'IG' if platform == 'instagram' else 'TK'


def load_exceptions():
    """Load known exceptions from JSON file."""
    if not os.path.exists(EXCEPTIONS_PATH):
        return set()
    with open(EXCEPTIONS_PATH) as f:
        data = json.load(f)
    return {e['handle'] for e in data.get('exceptions', [])}


# --- Heuristic functions ---

def heuristic_tld(account):
    handle = account['handle'].lower().rstrip('/')
    tld_match = re.search(r'\.([a-z]{2})$', handle)
    if not tld_match:
        return None

    tld = tld_match.group(1)

    if re.search(r'\.co\.kr$', handle):
        suggested = 'South Korea'
    elif tld in TLD_TO_COUNTRY:
        suggested = TLD_TO_COUNTRY[tld]
    else:
        return None

    assigned = account.get('country')
    if countries_equivalent(suggested, assigned):
        return None

    if tld == 'sk':
        name_lower = account['name'].lower()
        if any(x in name_lower for x in ['kempenzonen', 'sport kring', 's.k.', 'spor kulübü',
                                          'spor kulüb', 'karagümrük', 'karagumruk']):
            return None
        if assigned in ('Belgium', 'Turkey', 'Czech Republic', 'Sweden', 'Denmark', 'Norway'):
            return None

    return {
        'confidence': 'alta',
        'suggested': suggested,
        'reason': f'TLD ".{tld}" en handle → {suggested}'
    }


def heuristic_country_in_name(account):
    name = account['name']
    assigned = account.get('country')

    for country, variants in COUNTRY_NAMES.items():
        for variant in variants:
            if len(variant) <= 3:
                continue

            escaped = re.escape(variant)
            pattern = rf'(?<![a-záéíóúàèìòùäëïöüâêîôûãõñçšžčřďťňůĺľŕ]){escaped}(?![a-záéíóúàèìòùäëïöüâêîôûãõñçšžčřďťňůĺľŕ])'

            match_obj = re.search(pattern, name, re.IGNORECASE)
            if not match_obj:
                continue
            if countries_equivalent(country, assigned):
                continue
            if is_false_positive_name(name, variant, match_obj):
                continue

            sport_context = re.search(
                r'(team|football|soccer|cricket|rugby|hockey|basketball|baseball|'
                r'volleyball|handball|tennis|golf|swimming|athletics|olympic|'
                r'federation|national|race|league|cup|championship|grand prix|gp|'
                r'spartan|ufc|wsl|espn|nba|nfl|nhl|mlb|mls|f1|'
                r'club|fc|ac|sc|bc|hc|rc|'
                r'oficial|official|officiel)',
                name, re.IGNORECASE
            )
            confidence = 'alta' if sport_context else 'media'

            return {
                'confidence': confidence,
                'suggested': country,
                'reason': f'"{variant}" en nombre "{name}"'
            }
    return None


def heuristic_handle_country_suffix(account):
    handle = account['handle'].lower().rstrip('/')
    assigned = account.get('country')

    for country, variants in COUNTRY_NAMES.items():
        for variant in variants:
            if len(variant) <= 3:
                continue
            for delimiter in ['_', '.', '-']:
                suffix = delimiter + variant
                if handle.endswith(suffix):
                    if countries_equivalent(country, assigned):
                        continue
                    return {
                        'confidence': 'media',
                        'suggested': country,
                        'reason': f'Handle termina en "{suffix}" → {country}'
                    }
            if len(variant) >= 5 and handle.endswith(variant):
                prefix = handle[:-len(variant)]
                if len(prefix) >= 3:
                    if countries_equivalent(country, assigned):
                        continue
                    return {
                        'confidence': 'media',
                        'suggested': country,
                        'reason': f'Handle termina en "{variant}" → {country}'
                    }

    for code, country in CODE_TO_COUNTRY.items():
        code_lower = code.lower()
        for delimiter in ['_', '.']:
            suffix = delimiter + code_lower
            if handle.endswith(suffix) and len(handle) > len(suffix) + 2:
                if countries_equivalent(country, assigned):
                    continue
                if code_lower == 'sk' and assigned in ('Turkey', 'Belgium', 'Czech Republic'):
                    continue
                return {
                    'confidence': 'media',
                    'suggested': country,
                    'reason': f'Handle termina en "{suffix}" → {country} (código ISO)'
                }
    return None


def heuristic_federation_pattern(account):
    name = account['name'].lower()
    assigned = account.get('country')

    national_patterns = [
        r'(.+)\s+football\s+team',
        r'(.+)\s+cricket\s+team',
        r'(.+)\s+rugby\s+team',
        r'(.+)\s+hockey\s+team',
        r'(.+)\s+basketball\s+team',
        r'(.+)\s+national\s+team',
        r'federation\s+(.+)',
        r'(.+)\s+federation',
        r'(.+)\s+football\s+association',
        r'(.+)\s+cricket\s+association',
        r'(.+)\s+cricket$',
        r'(.+)\s+rugby$',
        r'team\s+(.+)',
    ]

    for pattern in national_patterns:
        match = re.search(pattern, name)
        if match:
            captured = match.group(1).strip()
            for country, variants in COUNTRY_NAMES.items():
                for variant in variants:
                    if variant.lower() == captured or country.lower() == captured:
                        if not countries_equivalent(country, assigned):
                            return {
                                'confidence': 'alta',
                                'suggested': country,
                                'reason': f'Entidad nacional "{account["name"]}" → {country}'
                            }
    return None


def heuristic_brand_local_edition(account):
    name = account['name']
    handle = account['handle'].lower().rstrip('/')
    assigned = account.get('country')

    global_brands = [
        'espn', 'ufc', 'wsl', 'spartan', 'redbull', 'red bull',
        'dazn', 'eurosport', 'fox sports', 'nba', 'nfl', 'nhl',
        'formula 1', 'f1', 'motogp', 'world surf league',
        'deka', 'crossfit', 'hyrox', 'mlb',
    ]

    name_lower = name.lower()
    is_brand = any(brand in name_lower or brand in handle for brand in global_brands)
    if not is_brand:
        return None

    for country, variants in COUNTRY_NAMES.items():
        for variant in variants:
            if len(variant) <= 3:
                continue
            escaped = re.escape(variant)
            if re.search(rf'\b{escaped}\b', name, re.IGNORECASE):
                if not countries_equivalent(country, assigned):
                    return {
                        'confidence': 'alta',
                        'suggested': country,
                        'reason': f'Marca global con edición local: "{name}" → {country}'
                    }
    return None


# --- Main audit logic ---

HEURISTICS = [
    ('TLD en handle', heuristic_tld),
    ('País en nombre', heuristic_country_in_name),
    ('Federación/equipo nacional', heuristic_federation_pattern),
    ('Marca global con edición local', heuristic_brand_local_edition),
    ('Sufijo de país en handle', heuristic_handle_country_suffix),
]


def audit_accounts(accounts, exceptions):
    """Run all heuristics. Returns list of findings, excluding known exceptions."""
    findings = []
    seen = set()

    for heur_name, heur_fn in HEURISTICS:
        for account in accounts:
            handle = account['handle']
            key = (handle, account['platform'])

            if key in seen or handle in exceptions:
                continue

            result = heur_fn(account)
            if result:
                findings.append({
                    'handle': handle,
                    'platform': account['platform'],
                    'name': account['name'],
                    'assigned_country': account.get('country'),
                    'assigned_code': account.get('countryCode', ''),
                    'suggested_country': result['suggested'],
                    'confidence': result['confidence'],
                    'reason': result['reason'],
                    'heuristic': heur_name,
                    'profile_url': account.get('profileUrl', ''),
                    'followers': account.get('followers', 0),
                    'category': account.get('category', ''),
                })
                seen.add(key)

    findings.sort(key=lambda x: (
        0 if x['confidence'] == 'alta' else 1,
        x['platform'],
        -x['followers']
    ))
    return findings


def generate_proposal(findings, stats, month, exceptions_count):
    """Generate the unified proposal document."""
    today = date.today().isoformat()
    alta = [f for f in findings if f['confidence'] == 'alta']
    media = [f for f in findings if f['confidence'] == 'media']

    output_path = os.path.join(AUDITS_DIR, f'{month}-proposal.md')

    lines = [
        f"# Auditoría de países — {month}",
        "",
        f"**Fecha de ejecución:** {today}",
        f"**Total cuentas analizadas:** {stats['total']} (IG: {stats['ig']}, TK: {stats['tk']})",
        f"**Excepciones conocidas excluidas:** {exceptions_count}",
        f"**Propuestas de cambio:** {len(findings)}",
        f"- Alta confianza: {len(alta)}",
        f"- Media confianza: {len(media)}",
        "",
        "---",
        "",
        "Revisa las propuestas a continuación. Indica a Claude las cuentas que deben",
        "mantener su país actual. El resto se actualizará con el país sugerido.",
        "",
    ]

    for label, group, desc in [
        ("Alta confianza", alta, "Indicadores claros. Se propone corrección directa salvo que indiques lo contrario."),
        ("Media confianza", media, "Requieren validación. Revisa cada caso antes de confirmar."),
    ]:
        if not group:
            continue
        lines.append(f"## {label}")
        lines.append("")
        lines.append(desc)
        lines.append("")
        lines.append("| # | Plat. | Handle | Nombre | Categoría | País actual | País sugerido | Motivo |")
        lines.append("|---|-------|--------|--------|-----------|-------------|---------------|--------|")
        for i, f in enumerate(group, 1):
            pl = platform_label(f['platform'])
            current = f"{f['assigned_country']} ({f['assigned_code']})" if f['assigned_country'] else '(sin asignar)'
            lines.append(
                f"| {i} | {pl} | `{f['handle']}` | {f['name']} | {f['category']} | "
                f"{current} | **{f['suggested_country']}** | {f['reason']} |"
            )
        lines.append("")

    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))

    return output_path


def run_audit():
    """Run the full audit."""
    # Parse optional --month argument
    month = date.today().strftime('%Y-%m')
    if '--month' in sys.argv:
        idx = sys.argv.index('--month')
        if idx + 1 < len(sys.argv):
            month = sys.argv[idx + 1]

    with open(ACCOUNTS_PATH) as f:
        data = json.load(f)

    exceptions = load_exceptions()

    all_accounts = data['accounts']
    ig = [a for a in all_accounts if a['platform'] == 'instagram']
    tk = [a for a in all_accounts if a['platform'] == 'tiktok']

    stats = {
        'total': len(all_accounts),
        'ig': len(ig),
        'tk': len(tk),
    }

    print(f"Auditoría de países — {month}")
    print(f"Total cuentas: {stats['total']} (IG: {stats['ig']}, TK: {stats['tk']})")
    print(f"Excepciones conocidas: {len(exceptions)}")
    print()

    findings = audit_accounts(all_accounts, exceptions)
    alta = [f for f in findings if f['confidence'] == 'alta']
    media = [f for f in findings if f['confidence'] == 'media']

    print(f"Propuestas de cambio: {len(findings)}")
    print(f"  Alta confianza: {len(alta)}")
    print(f"  Media confianza: {len(media)}")

    output_path = generate_proposal(findings, stats, month, len(exceptions))
    print(f"\nPropuesta generada: {output_path}")


if __name__ == '__main__':
    run_audit()

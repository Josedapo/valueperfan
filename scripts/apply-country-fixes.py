#!/usr/bin/env python3
"""
Apply country corrections to accounts.json and search-index.json.
Generates a final report for sharing with Horizm.

This script is called by Claude after Joseda reviews the audit proposal
and indicates which accounts should keep their current country.

Usage: Called programmatically by Claude, not directly by the user.
"""

import json
import os
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..')
VPF_ROOT = os.path.join(PROJECT_ROOT, '..')
ACCOUNTS_PATH = os.path.join(PROJECT_ROOT, 'src', 'data', 'accounts.json')
SEARCH_INDEX_PATH = os.path.join(PROJECT_ROOT, 'src', 'data', 'search-index.json')
EXCEPTIONS_PATH = os.path.join(VPF_ROOT, 'Country Audits', 'known-exceptions.json')
AUDITS_DIR = os.path.join(VPF_ROOT, 'Country Audits')

COUNTRY_TO_CODE = {
    'United States': 'US', 'United Kingdom': 'GB', 'Brazil': 'BR',
    'France': 'FR', 'Spain': 'ES', 'Germany': 'DE', 'Italy': 'IT',
    'India': 'IN', 'Australia': 'AU', 'Portugal': 'PT', 'Mexico': 'MX',
    'Argentina': 'AR', 'Netherlands': 'NL', 'Japan': 'JP', 'Poland': 'PL',
    'Canada': 'CA', 'Czech Republic': 'CZ', 'Belgium': 'BE',
    'South Africa': 'ZA', 'Turkey': 'TR', 'Russia': 'RU', 'Sweden': 'SE',
    'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI', 'Austria': 'AT',
    'Switzerland': 'CH', 'Ireland': 'IE', 'Romania': 'RO', 'Croatia': 'HR',
    'Serbia': 'RS', 'Hungary': 'HU', 'Ukraine': 'UA', 'Greece': 'GR',
    'Bulgaria': 'BG', 'Slovakia': 'SK', 'Slovenia': 'SI',
    'South Korea': 'KR', 'China': 'CN', 'Thailand': 'TH',
    'Indonesia': 'ID', 'Malaysia': 'MY', 'Philippines': 'PH',
    'Vietnam': 'VN', 'Singapore': 'SG', 'Pakistan': 'PK',
    'Bangladesh': 'BD', 'Colombia': 'CO', 'Chile': 'CL', 'Peru': 'PE',
    'Ecuador': 'EC', 'Paraguay': 'PY', 'Uruguay': 'UY', 'Venezuela': 'VE',
    'Nigeria': 'NG', 'Ghana': 'GH', 'Kenya': 'KE', 'Egypt': 'EG',
    'Morocco': 'MA', 'Israel': 'IL', 'Iran': 'IR', 'Saudi Arabia': 'SA',
    'Qatar': 'QA', 'United Arab Emirates': 'AE', 'New Zealand': 'NZ',
    'Jamaica': 'JM', 'Nepal': 'NP', 'Taiwan': 'TW', 'Oman': 'OM',
    'Bahrain': 'BH', 'Monaco': 'MC', 'Andorra': 'AD',
    'Scotland': 'GB', 'Wales': 'GB',
    'Iceland': 'IS', 'Albania': 'AL', 'Montenegro': 'ME',
    'North Macedonia': 'MK', 'Kosovo': 'XK',
    'Bosnia and Herzegovina': 'BA', 'Moldova': 'MD',
    'Latvia': 'LV', 'Lithuania': 'LT', 'Estonia': 'EE',
    'Belarus': 'BY', 'Georgia': 'GE', 'Armenia': 'AM',
    'Azerbaijan': 'AZ', 'Kazakhstan': 'KZ',
    'Dominican Republic': 'DO', 'Puerto Rico': 'PR',
    'Cuba': 'CU', 'Costa Rica': 'CR', 'Panama': 'PA',
    'Honduras': 'HN', 'El Salvador': 'SV', 'Guatemala': 'GT',
    'Bolivia': 'BO', 'Cyprus': 'CY', 'Luxembourg': 'LU',
    'Sri Lanka': 'LK', 'Cambodia': 'KH', 'Myanmar': 'MM',
}


def apply_fixes(fixes, keep_handles, month):
    """
    Apply country fixes to accounts.json and search-index.json.

    Args:
        fixes: dict of (handle, platform) → new_country
        keep_handles: set of handles to skip (keep current country)
        month: str like '2026-03' for the report filename
    """
    with open(ACCOUNTS_PATH) as f:
        data = json.load(f)

    changes = []

    for account in data['accounts']:
        key = (account['handle'], account['platform'])
        if account['handle'] in keep_handles:
            continue
        if key not in fixes:
            continue

        new_country = fixes[key]
        new_code = COUNTRY_TO_CODE.get(new_country, '')
        old_country = account.get('country') or '(sin asignar)'
        old_code = account.get('countryCode') or ''
        change_type = 'corrección' if account.get('country') else 'asignación'

        changes.append({
            'handle': account['handle'],
            'platform': account['platform'],
            'name': account['name'],
            'category': account.get('category', ''),
            'old_country': old_country,
            'old_code': old_code,
            'new_country': new_country,
            'new_code': new_code,
            'type': change_type,
        })

        account['country'] = new_country
        account['countryCode'] = new_code

    # Save accounts.json
    with open(ACCOUNTS_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Update search-index.json
    if os.path.exists(SEARCH_INDEX_PATH):
        with open(SEARCH_INDEX_PATH) as f:
            search_data = json.load(f)

        search_updated = 0
        for entry in search_data:
            key = (entry.get('handle', entry.get('slug', '')), entry.get('platform', ''))
            if key in fixes and entry.get('handle', entry.get('slug', '')) not in keep_handles:
                entry['country'] = fixes[key]
                search_updated += 1

        with open(SEARCH_INDEX_PATH, 'w') as f:
            json.dump(search_data, f, ensure_ascii=False)

        print(f"Search index actualizado: {search_updated} entradas")

    # Generate report
    report_path = generate_report(changes, month)

    corrections = [c for c in changes if c['type'] == 'corrección']
    assignments = [c for c in changes if c['type'] == 'asignación']
    print(f"Cambios aplicados: {len(changes)}")
    print(f"  Correcciones: {len(corrections)}")
    print(f"  Asignaciones: {len(assignments)}")
    print(f"Informe: {report_path}")

    return changes


def generate_report(changes, month):
    """Generate final report for Horizm."""
    today = date.today().isoformat()
    corrections = [c for c in changes if c['type'] == 'corrección']
    assignments = [c for c in changes if c['type'] == 'asignación']

    report_path = os.path.join(AUDITS_DIR, f'{month}-changes-report.md')

    lines = [
        f"# ValuePerFan — Correcciones de país ({month})",
        "",
        f"**Fecha:** {today}",
        f"**Total cambios aplicados:** {len(changes)}",
        f"- Correcciones (país incorrecto → país correcto): {len(corrections)}",
        f"- Asignaciones nuevas (sin país → país asignado): {len(assignments)}",
        "",
        "Estos cambios se han detectado mediante un análisis heurístico automatizado",
        "y se han validado manualmente antes de aplicar.",
        "",
        "---",
        "",
    ]

    if corrections:
        lines.append("## Correcciones de país")
        lines.append("")
        lines.append("| # | Plataforma | Handle | Nombre | Categoría | País anterior | País corregido |")
        lines.append("|---|------------|--------|--------|-----------|---------------|----------------|")
        for i, c in enumerate(corrections, 1):
            pl = 'Instagram' if c['platform'] == 'instagram' else 'TikTok'
            lines.append(
                f"| {i} | {pl} | `{c['handle']}` | {c['name']} | {c['category']} | "
                f"{c['old_country']} ({c['old_code']}) | **{c['new_country']}** ({c['new_code']}) |"
            )
        lines.append("")

    if assignments:
        lines.append("## Asignaciones nuevas de país")
        lines.append("")
        lines.append("| # | Plataforma | Handle | Nombre | Categoría | País asignado |")
        lines.append("|---|------------|--------|--------|-----------|---------------|")
        for i, c in enumerate(assignments, 1):
            pl = 'Instagram' if c['platform'] == 'instagram' else 'TikTok'
            lines.append(
                f"| {i} | {pl} | `{c['handle']}` | {c['name']} | {c['category']} | "
                f"**{c['new_country']}** ({c['new_code']}) |"
            )
        lines.append("")

    with open(report_path, 'w') as f:
        f.write('\n'.join(lines))

    return report_path

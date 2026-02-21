# Hypoteční kalkulačka — Master plán rozšíření

> **Pro Claude:** Toto je hlavní zadání projektu. Vracej se sem při ztrátě kontextu.

**Projekt:** Hypoteční kalkulačka (React 19 + TypeScript + Vite + Supabase)
**Repo:** https://github.com/Peettea/mortgage-calculator
**Vercel:** https://mortgage-calculator-m42j.vercel.app
**Supabase projekt:** snapzkzlvwtkvhwsmyto

---

## Hotové funkce

- [x] Základní kalkulačka (anuitní splátky, amortizační plán, grafy)
- [x] Dark mode
- [x] React Hook Form + Zod validace
- [x] Routing (/, /history, /about)
- [x] Ukládání do Supabase (tabulka `mortgage_calculations`)
- [x] Historie výpočtů s mazáním
- [x] Vercel deployment
- [x] Vitest testy (15 testů)

---

## Plánované funkce (v pořadí priority)

### 1. Srovnání hypoték — HOTOVO
- Nová stránka `/compare`
- 2–3 plně editovatelné scénáře (každý má částku, sazbu, dobu)
- Srovnávací tabulka + sloupcový graf (Recharts)
- Barevné rozlišení scénářů (modrá, zelená, oranžová)
- Zvýraznění nejlevnějšího scénáře
- Tlačítka přidat/odebrat scénář
- Responsivní (karty vedle sebe / pod sebou)

### 2. Mimořádné splátky — HOTOVO
- Pravidelná měsíční mimořádná splátka
- Jednorázová mimořádná splátka v libovolném měsíci
- Zobrazení úspory na úrocích a zkrácení doby
- Horizontální graf porovnání úroků

### 3. Fixace sazby + refinancování — HOTOVO
- Výběr délky fixace (1, 3, 5, 7, 10 let)
- Simulace nové sazby po fixaci
- Porovnání 3 scénářů: současná / po fixaci / refinancování
- Graf celkových úroků

### 4. Daňový odpočet — HOTOVO
- Výpočet odpočtu úroků z daní (max 150 000 Kč/rok v ČR)
- Tabulka prvních 5 let s detaily
- Celková úspora na dani + efektivní sazba

### 5. Inflační pohled — HOTOVO
- Nastavitelná míra inflace
- Graf nominální vs. reálné hodnoty splátky
- Pokles kupní síly v procentech

### 6. PDF export — HOTOVO
- Stáhnutí PDF s parametry, výsledky a amortizačním plánem
- Tlačítko "Stáhnout PDF" vedle uložení

### 7. Sdílení výpočtu — HOTOVO
- Tlačítko "Sdílet odkaz" zkopíruje URL s parametry
- Načtení parametrů z URL při otevření

### 8. PWA (Progressive Web App) — HOTOVO
- vite-plugin-pwa s autoUpdate
- Manifest, service worker, offline cache
- Instalovatelné na telefon z prohlížeče

---

## Technické poznámky

- **Jazyk UI:** čeština
- **Commit messages:** čeština
- **DB tabulky prefix:** `mortgage_`
- **Supabase anon key:** v `src/api/calculations.ts`
- **Superpowers plugin:** nainstalován, používat brainstorming → writing-plans → subagent-driven-development
- **Zod v4:** používá `error` místo `invalid_type_error`
- **Vitest:** reference `vitest/config` (ne `vitest`)

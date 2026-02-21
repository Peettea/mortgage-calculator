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

### 1. Srovnání hypoték — STAV: ROZPRACOVÁNO
- Nová stránka `/compare`
- 2–3 plně editovatelné scénáře (každý má částku, sazbu, dobu)
- Srovnávací tabulka + sloupcový graf (Recharts)
- Barevné rozlišení scénářů (modrá, zelená, oranžová)
- Zvýraznění nejlevnějšího scénáře
- Tlačítka přidat/odebrat scénář
- Responsivní (karty vedle sebe / pod sebou)

### 2. Mimořádné splátky
- Zadání jednorázové nebo pravidelné mimořádné splátky
- Přepočet: kolik se ušetří na úrocích, o kolik se zkrátí doba
- Vizuální porovnání "bez vs. s mimořádnou splátkou"

### 3. Fixace sazby + refinancování
- Zadání délky fixace (např. 3, 5, 7 let)
- Simulace: co se stane po konci fixace při nové sazbě
- Porovnání: zůstat vs. refinancovat u jiné banky

### 4. Daňový odpočet
- Výpočet odpočtu úroků z daní (max 150 000 Kč/rok v ČR)
- Zobrazení reálné efektivní sazby po odpočtu

### 5. Inflační pohled
- Reálná hodnota splátky za 10, 20, 30 let
- Graf kupní síly splátky v čase

### 6. PDF export
- Vygenerování PDF reportu s výpočtem
- Pro schůzku v bance

### 7. Sdílení výpočtu
- Unikátní URL s parametry výpočtu
- Kdokoliv s odkazem vidí výsledek

### 8. PWA (Progressive Web App)
- Instalace na telefon z prohlížeče
- Offline podpora

---

## Technické poznámky

- **Jazyk UI:** čeština
- **Commit messages:** čeština
- **DB tabulky prefix:** `mortgage_`
- **Supabase anon key:** v `src/api/calculations.ts`
- **Superpowers plugin:** nainstalován, používat brainstorming → writing-plans → subagent-driven-development
- **Zod v4:** používá `error` místo `invalid_type_error`
- **Vitest:** reference `vitest/config` (ne `vitest`)

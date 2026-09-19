# IBS Diary — pravidlá pre prácu v tomto repozitári

Všeobecné pravidlá sú prevzaté z `C:\Work - Claude Code\PetNest\CLAUDE.md` (projekt
PetActa) a platia rovnako tu. Čo je špecifické pre PetActa — Flutter, brána
závislostí, BMAD artefakty, Firestore — sa sem neprenáša.

## O čom to je

**IBS Diary** — denník stravovania a tráviacich ťažkostí.

| Časť | Stav |
|---|---|
| Webová aplikácia (`src/`) | hotová, v prevádzke. Next.js 15 pages router + React 18 + TypeScript + Tailwind/shadcn + Supabase |
| Mobilná aplikácia | **v návrhu** — `docs/mobile-app-navrh.md`. React Native + Expo, Android a iOS, monetizácia reklamou |

Ťažisko práce je mobilná verzia. Do webu sa zasahuje len na vyžiadanie — slúži
ako funkčná predloha a zdroj biznis logiky.

⚠️ Projekt vznikol zo šablóny `softgen-starter`. Zvyšky po nej (Stripe
závislosti, `ecosystem.config.js`, tabuľka `food_entries` z prvej migrácie)
nie sú súčasťou produktu.

## Ako komunikovať

- **Po slovensky**, v hovore aj v dokumentoch.
- Užívateľ je **Patio** *(Ing. Patrik Karaba)*, sólo vývojár. Úroveň
  `intermediate` — netreba vysvetľovať základy, ale netreba ani predpokladať,
  že pozná každý nástroj.
- **Identifikátory v novom kóde sa píšu po slovensky** *(`Vysledok`, `skus`,
  `vybav`)* — rámcové API zostávajú anglické, doména je slovenská. Platí to pre
  mobilnú aplikáciu od prvého riadku. Existujúci web má anglické identifikátory
  a **neprepisuje sa** — miešanie dvoch konvencií v jednom súbore je horšie než
  jedna nekonzistentná hranica medzi projektmi.

## Git

🔴 **Commituje sa priamo do `main`.** Žiadna feature vetva, a **nepýtaj sa na
to** — je to stojace rozhodnutie.

Commit správy sa píšu **po anglicky**, ako vety o tom, čo sa naozaj stalo
a prečo — nie ako zoznam zmenených súborov.

`git push` sa nerobí bez vyžiadania. Commituje sa priebežne, odosiela na pokyn.

## Ako sa tu overuje

🔴 **Meraj, nehádaj — a nehovor „overené", kým to, čo si napísal, nebolo
v porovnaní.**

- pri grafike porovnávaj **vyrenderované body**, nie reťazce
- pri sieťových a DNS veciach čítaj **nezávislým nástrojom**, nie z panela
  poskytovateľa
- pri hodnotách kontroluj **dĺžku a číslo**, nie vzhľad
- keď niečo „má zlyhať", **over to porušením naschvál**

Zoznam zvonku je dôkaz **zhody**, nie **úplnosti** — nájde len to, na čo si sa
spýtal.

## Testy

⚠️ **Tento repozitár zatiaľ nemá žiadne testy.** Nepredstieraj, že prechádzajú.
Keď pribudnú — a pri mobilnej aplikácii pribudnú od začiatku — platí pravidlo
z PetActa:

🔴 **Celá sada, nie len dotknutý súbor** — pred odškrtnutím úlohy, pred každým
commitom meniacim kód, pred označením nálezu kontroly kódu za opravený a pred
prepnutím príbehu na `review`/`done`. Dôvod je odmeraný, nie teoretický:
v PetActa spôsobil únik globálneho stavu pád piatich testov v súboroch, ktoré
s opravovanou zmenou na pohľad nesúviseli.

⚠️ **Formátuj len to, čoho si sa dotkol.** Formátovač na celý priečinok prepíše
desiatky cudzích súborov a rozšíri rozsah commitu o niečo, čo nikto nežiadal.

## Výber modelu (Opus vs. Sonnet)

Model poznáš zo systémového promptu. **Pred novou väčšou úlohou** ho porovnaj
s tabuľkou. Nesúlad neriešiš tichým pokračovaním — **jednou vetou to Patiovi
povedz** a rozhodnutie nechaj na ňom (`/model` v termináli). Pri drobnostiach
uprostred tej istej úlohy sa to nerieši znova.

| Úloha | Model | Prečo |
|---|---|---|
| návrh dátového modelu, architektonické rozhodnutia | **Opus** | chyba sa prejaví o niekoľko krokov neskôr |
| kontrola kódu | **Opus** | nálezy typu „toto je odškrtnuté a nie je zatvorené" |
| návrh korelačného algoritmu a čokoľvek štatistické | **Opus** | ticho nesprávny výsledok je horší než žiadny |
| implementácia podľa hotového zadania | Sonnet stačí | z veľkej časti vykonávanie |
| preklady, mechanické refaktory, spúšťanie testov | Sonnet stačí | |
| commity, dokumentácia | Sonnet stačí | |

💡 Kontrola kódu má bežať na **inom modeli**, než ktorý kód písal.

⚠️ **Podagenti (Agent/Task volania) sú drahšie než rozdiel modelov** — tri
kontrolné vrstvy vedia spolu minúť 600-tisíc tokenov. Nespúšťaj ich bez
vyžiadania.

## Veľkosť session

Každý ďalší ťah posiela celý doterajší kontext znova — náklady dlhej session
rastú zrýchlene.

**Meraj, nehádaj:**

```
mcp__ccd_session_mgmt__get_usage   session_id: "self"
```

⚠️ **Nekontroluj to priebežne** — pozri sa **na hranici úlohy**: po dokončenom
kroku, po commite, pred pustením sa do niečoho veľkého.

🔴 **Nad 50 % navrhni novú session** — ale **len keď sú splnené obe** podmienky:

1. rozrobená práca je **dokončená a commitnutá**, nie napoly
2. to, čo príde ďalej, sa dá zadať z dokumentu — nestojí to na niečom, čo je
   len v tejto konverzácii

Ak druhá neplatí, **najprv to doplň do dokumentu** a navrhni to potom.

### Ako sa odovzdáva

Cez `Posledna session.md` v `C:\Work - Claude Code\pomocne dokumenty - poznamky\`.
Návrh má tri časti: **číslo** (percento kontextu), **prepísaný
`Posledna session.md`** (stav, čo sa spravilo, ako sa to overilo, čo zostáva
otvorené, čo je blokované na Patiovi) a **prvý prompt pre novú session**, krátky
a ukazujúci na dokument.

⚠️ **Rozhodnutie je Patiovo.** Navrhuje sa raz; keď povie, že pokračujeme tu,
netreba sa pýtať znova pri každej ďalšej hranici.

## Čo sa nerobí bez opýtania

- prihlasovanie do jeho účtov *(Supabase, Vercel, Google, Play Console,
  App Store Connect, AdMob)*
- nasadzovanie, migrácie proti produkčnej databáze, čokoľvek s vonkajším dosahom
- prijímanie licenčných a zmluvných podmienok za neho
- `git push`

## Jazyky

PetActa má podmienky používania a zásady ochrany súkromia v **piatich jazykoch**
*(sk, en, cs, de, es)*. Mobilná IBS Diary má ísť rovnakou pätorkou — právne texty
sa dajú z veľkej časti prevziať a je to hotová práca, ktorú netreba robiť znova.

⚠️ **Každá zmena v jednom jazyku je päť zmien.**

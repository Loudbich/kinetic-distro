# Kinetic Distro — site officiel

Site vitrine du label **Kinetic Distro** : roster, catalogue, services de distribution,
soumission de démos, contact. Contenu 100 % anglais.

Stack : **Vite 8 + React 19 + TypeScript + Tailwind CSS 3 + React Router 7**
— la même famille technique que le site Grafenberg de Téo, donc reprenable par lui sans friction.

---

## 1. Démarrage

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, compile, pré-rend 25 pages HTML, génère le sitemap
npm run preview:static  # sert dist/ comme le fera la prod (à utiliser pour vérifier)
npm run audit      # audit SEO du dist/ construit
npm test           # tests hors-ligne des parsers de synchro
```

Node 20+ requis. L'adresse publique du site est dans `.env` (`VITE_SITE_URL`) — c'est le
seul endroit à changer si le domaine évolue.

---

## 2. Où se trouve le contenu

**Tout le contenu éditorial est dans un seul fichier : `src/content/site.ts`.**
Aucun composant n'a besoin d'être modifié pour ajouter un artiste, une sortie ou un lien.

| Bloc | Ce qu'il contrôle |
|---|---|
| `site` | Nom, emails, liens réseaux, manifesto, année de création |
| `artists[]` | Le roster complet — une entrée = une page `/roster/<slug>` créée automatiquement |
| `releases[]` | Le catalogue — une entrée = une page `/releases/<slug>` créée automatiquement |
| `services[]` | Les 4 blocs de la page Distribution (repris en teaser sur la home) |
| `nav[]` | Le menu principal (header + footer + drawer mobile) |

### Ajouter un artiste

```ts
{
  slug: 'nouveau-projet',          // ← devient l'URL /roster/nouveau-projet
  name: 'Nouveau Projet',
  accent: '#00E5FF',               // ← couleur d'accent propre à l'artiste
  genre: 'Ambient / Drone',
  origin: 'France',
  since: '2026',
  tagline: 'Une phrase, pas deux.',
  bio: ['Paragraphe 1.', 'Paragraphe 2.'],
  traits: ['Trait 1', 'Trait 2', 'Trait 3'],
  links: [{ label: 'Bandcamp', href: 'https://…' }],
  featured: true,                  // optionnel
  image: '/artists/nouveau.jpg',   // optionnel
}
```

### Ajouter une sortie

```ts
{
  slug: 'titre-du-disque',
  catalog: 'KD-007',
  title: 'Titre Du Disque',
  artistSlugs: ['nouveau-projet'],       // doit correspondre aux slugs du roster
  artistDisplay: 'Nouveau Projet',
  date: '2026-09-15',                    // ISO — sert au tri et au sitemap
  format: 'Digital · 8 tracks',
  type: 'Album',                         // Album | EP | Single | Compilation | Remix album
  blurb: 'Deux ou trois phrases.',
  tracklist: ['Track 1', 'Track 2'],     // optionnel
  listenUrl: 'https://…',
  image: '/covers/kd-007.jpg',           // optionnel — voir §3
}
```

---

## 3. Les pochettes

Tant qu'aucun visuel réel n'est fourni, le composant `src/components/Cover.tsx` génère une
**pochette procédurale déterministe** : le même slug produit toujours exactement la même image,
construite à partir de la couleur d'accent de l'artiste. Cinq compositions différentes.

Pour passer aux vraies pochettes :

1. Déposer le fichier dans `public/covers/` (carré, 1400 × 1400 px minimum, JPG ou WebP).
2. Ajouter `image: '/covers/kd-006.jpg'` sur la sortie concernée dans `site.ts`.

Le composant bascule automatiquement sur l'image réelle. Même logique pour les portraits
d'artistes via `public/artists/` et le champ `image` sur l'artiste.

---

## 4. Système de design

| Token | Valeur | Usage |
|---|---|---|
| `ink` | `#08090A` | Fond principal |
| `ink-800` | `#0E1012` | Fond des sections alternées |
| `paper` | `#F4F2ED` | Texte principal |
| `chrome` | `#B8BEC7` | Texte secondaire |
| `signal` | `#FF4D12` | Accent du label |

**Le label est monochrome. La couleur vient des artistes.** Chaque artiste porte son propre
`accent`, injecté dans la variable CSS `--accent` sur ses pages (roster + release). C'est le
principe central de la DA : Kinetic Distro fournit le cadre, l'artiste fournit la couleur.

Typographie : **Archivo Variable** (axe de chasse `wdth` exploité — 120 % pour les titres,
78 % pour les sous-titres) + **JetBrains Mono** pour les labels et métadonnées.
Les deux polices sont **auto-hébergées** (`@fontsource-variable`) : aucune requête vers Google
Fonts, donc pas de sujet CNIL/RGPD sur les transferts d'IP.

Classes utilitaires maison dans `src/index.css` : `.display`, `.display-tight`, `.label`,
`.shell`, `.btn-signal`, `.btn-ghost`, `.link-underline`, `.grid-lines`, `.noise`.

---

## 5. SEO, Knowledge Graph & performance

### Le site est pré-rendu, pas un SPA aveugle

`npm run build` génère **25 vrais fichiers HTML**, un par URL, chacun avec son propre
`<title>`, sa meta description, son canonical, ses balises Open Graph et son JSON-LD —
plus le corps de page entièrement rendu.

C'est le point qui change tout. Googlebot exécute le JavaScript, mais **l'extraction
d'entités pour le Knowledge Graph, les crawlers sociaux (Facebook, LinkedIn, Slack,
Discord, WhatsApp) et les robots derrière les assistants IA ne l'exécutent pas**. Avec un
seul `index.html` et des metas injectées en JS, ces robots voient exactement la même page
d'accueil générique pour les 24 URLs. Ici, chaque URL est servie complète et autonome.

```
dist/
├── index.html                              /
├── 404.html                                (statut HTTP 404 réel)
├── roster/index.html                       /roster
├── roster/grafenberg/index.html            /roster/grafenberg
├── releases/index.html                     /releases
└── releases/chrome-syndicate-dreams/index.html
```

Vérifie-le toi-même : `npm run preview:static` puis coupe JavaScript dans ton navigateur.
La page reste entière. *(N'utilise pas `npm run preview` pour ce test : `vite preview`
applique un fallback SPA qui sert `index.html` pour toutes les URLs et masque le
pré-rendu.)*

### Le graphe d'entités

Chaque page porte un `@graph` schema.org dont les entités se référencent par `@id` stable
plutôt que d'être dupliquées. **106 entités uniques, 286 références, 0 référence orpheline.**

| Type de page | Entités déclarées |
|---|---|
| Toutes | `Organization` (le label) + `WebSite` |
| Accueil | + `WebPage`, `ItemList` du roster |
| Roster | + `CollectionPage`, `ItemList` de 10 `MusicGroup` |
| Page artiste | + `ProfilePage`, `BreadcrumbList`, `MusicGroup` complet, ses `MusicAlbum` |
| Catalogue | + `CollectionPage`, `ItemList` de tous les `MusicAlbum` |
| Page album | + `ItemPage`, `BreadcrumbList`, `MusicAlbum` + un `MusicRecording` par piste |
| Distribution | + `OfferCatalog` de 4 `Service` |
| About | + `AboutPage` pointant sur l'`Organization` |
| Demos | + `FAQPage` (4 questions éligibles aux rich results) |
| Contact | + `ContactPage`, 3 `ContactPoint` |

Le label est le **hub du graphe** : chaque album pointe vers lui via `recordLabel`, chaque
artiste aussi, chaque page via `publisher`. C'est exactement la topologie qu'un moteur
attend pour consolider une entité « maison de disques » et lui rattacher son roster.

L'`Organization` porte `additionalType: wikidata.org/wiki/Q18127` (le concept « label
discographique ») — un signal de désambiguïsation explicite pour la réconciliation
d'entités.

### Ce qui manque encore pour un vrai Knowledge Panel

Le balisage est complet, mais un panneau de connaissances ne se déclenche pas sur du
balisage seul. Il faut des **corroborations externes**, et c'est du travail hors-site :

1. **Remplir `site.links`** dans `site.ts` — Instagram, YouTube, Spotify sont encore à `#`
   et sont donc exclus du `sameAs`. Le `sameAs` est le mécanisme principal de
   réconciliation : plus il est fourni, mieux l'entité est identifiée.
2. **Créer une entrée MusicBrainz** pour le label et chaque artiste, puis ajouter les URLs
   au `sameAs`. MusicBrainz alimente une bonne partie des bases d'entités musicales.
3. **Créer un élément Wikidata** pour Kinetic Distro (avec la propriété P856 « site
   officiel »), et remplacer `additionalType` par `sameAs: ['https://www.wikidata.org/wiki/Qxxxxx']`.
4. **Revendiquer le profil Google Business / Search Console** et soumettre le sitemap.
5. **Obtenir des mentions tierces cohérentes** — presse, blogs, agrégateurs — utilisant
   exactement la même graphie « Kinetic Distro ».

Points 1 à 4 : quelques heures. Point 5 : c'est le vrai travail, et aucun balisage ne le
remplace.

### L'audit automatique

```bash
npm run audit
```

Contrôle sur le `dist/` construit, sans navigateur ni réseau, ce que reçoit un crawler
qui n'exécute pas JS : title et description **uniques** par URL et de longueur correcte,
canonical, directive robots, Open Graph, JSON-LD parsable, exactement un `<h1>`, du texte
réellement rendu, des liens internes, l'intégrité des références `@id` et la complétude du
sitemap. Le job GitHub Actions le lance à chaque build : **une régression SEO fait échouer
le déploiement** au lieu de passer inaperçue.

### Autres points

- `sitemap.xml` régénéré à chaque build, avec un `<lastmod>` réel (date de sortie pour un
  album, date de la dernière sortie pour un artiste) et non la date du jour.
- `robots.txt` autorise explicitement GPTBot, PerplexityBot et ClaudeBot — le balisage est
  fait pour eux aussi.
- URLs propres, en anglais, sans paramètre, stables : `/roster/<slug>`, `/releases/<slug>`.
- Bundle : ~96 kB gzip JS, ~9 kB gzip CSS. Polices woff2 variables auto-hébergées.
- Le HTML pré-rendu s'affiche avant même que le JS ne charge → LCP très bas.
- Accessibilité : skip link, focus visible, `prefers-reduced-motion`, contrastes AA,
  navigation clavier, `aria-label` sur les contrôles. Les animations d'apparition sont
  conditionnées à une classe `html.js` : **sans JavaScript, rien n'est masqué en
  `opacity: 0`** — aucun risque de « texte caché » aux yeux d'un crawler.

> **À faire avant mise en ligne :** remplacer `https://kineticdistro.com` par le domaine
> réel dans **un seul endroit** — la constante `BASE_URL` en haut de `src/lib/seo.ts` —
> puis dans `public/robots.txt`. Et remplacer `og-cover.svg` par un PNG 1200 × 630
> (plusieurs réseaux ignorent le SVG dans les cartes de partage).

---

## 6. Déploiement — GitHub Pages sur www.kinetic-distro.com

Le site est configuré pour **GitHub Pages avec le domaine `www.kinetic-distro.com`**.
Tout est déjà en place dans le dépôt : il reste à créer le repo, pousser, activer Pages
et régler le DNS.

### 6.1 Créer le dépôt et pousser

Sur github.com : **New repository** → nom au choix (par ex. `kinetic-distro`) →
**Public** (Pages sur un dépôt privé exige un compte Pro/Team) → ne coche **rien**
(pas de README, pas de .gitignore, pas de licence : le projet les apporte).

Puis, depuis le dossier du projet :

```bash
git init
git add .
git commit -m "Kinetic Distro — site officiel"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/kinetic-distro.git
git push -u origin main
```

### 6.2 Activer GitHub Pages

Dans le dépôt : **Settings → Pages**.

- **Source** : choisir **GitHub Actions** (⚠️ pas « Deploy from a branch » — le site a
  besoin d'une étape de build, la branche seule ne suffirait pas).

C'est tout. Le workflow `.github/workflows/deploy.yml` prend le relais : il teste,
synchronise SoundCloud, build, **audite le SEO**, et publie. Si l'audit échoue, rien
n'est déployé.

### 6.3 Le DNS chez ton registrar

Deux séries d'enregistrements. Le `CNAME` fait vivre le site, les `A`/`AAAA` font que
`kinetic-distro.com` sans le `www` redirige automatiquement vers `www` (GitHub s'en
charge dès que les deux sont configurés).

**Le sous-domaine www** — l'adresse réelle du site :

| Type | Nom | Valeur |
|---|---|---|
| CNAME | `www` | `TON-PSEUDO.github.io` |

**Le domaine nu** — pour la redirection vers www :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Vérifier depuis un terminal (peut prendre jusqu'à 24 h) :

```bash
dig www.kinetic-distro.com +noall +answer
dig kinetic-distro.com +noall +answer
```

### 6.4 Le HTTPS

Une fois le DNS propagé, retourne dans **Settings → Pages** et coche
**Enforce HTTPS**. GitHub génère un certificat Let's Encrypt automatiquement — la case
reste grisée tant que le DNS n'est pas résolu, c'est normal, il suffit d'attendre.

### 6.5 Ce que Pages gère nativement

Le fichier `public/CNAME` contient `www.kinetic-distro.com` : **ne le supprime pas**,
c'est lui qui déclare le domaine à chaque déploiement. Un `.nojekyll` est généré au build
pour empêcher Pages de faire tourner Jekyll (qui ignorerait silencieusement les fichiers
commençant par `_`). Le `404.html` est reconnu nativement par Pages et renvoie un vrai
statut 404.

### 6.6 Les URLs se terminent par un slash

Chaque page est un dossier avec son `index.html` :
`/roster/grafenberg/` → `dist/roster/grafenberg/index.html`.

Tous les hôtes statiques — Pages compris — servent cette forme en 200 et redirigent en
301 la forme sans slash. Les canonicals, le sitemap, les `@id` du JSON-LD **et les liens
internes** utilisent donc tous le slash final : aucun crawler ne traverse de redirection.
L'audit vérifie cette cohérence à chaque build et échoue si un canonical dérive.

### 6.7 Changer de domaine plus tard

Une seule ligne, dans `.env` :

```
VITE_SITE_URL=https://www.kinetic-distro.com
```

Canonicals, Open Graph, `@id` du graphe d'entités, sitemap et robots.txt en découlent
tous. Pense aussi à mettre à jour `public/CNAME`.

### 6.8 Si tu quittes GitHub Pages un jour

Le projet reste portable : `deploy/apache/.htaccess` contient la configuration Apache
équivalente (réécritures, gzip, cache immuable sur les assets hashés) pour un hébergement
mutualisé type OVH. Il n'est pas copié dans `dist/` — déplace-le dans `public/` si tu en
as besoin.

---

## 7. Le formulaire de démos

`src/pages/Demos.tsx` n'utilise **aucun backend** : il compose un email pré-rempli dans le client
mail du visiteur (`mailto:`). Rien n'est stocké, rien ne transite par un tiers.

Pour passer sur un vrai endpoint (Formspree, Netlify Forms, API maison), remplacer le corps de
`onSubmit` par un `fetch()` — le commentaire dans le fichier indique l'emplacement exact.

---

## 8. Structure

```
src/
├── components/
│   ├── Layout.tsx      header fixe + drawer mobile + footer + scroll restoration
│   ├── Cover.tsx       pochettes génératives déterministes
│   ├── Reveal.tsx      apparition au scroll (IntersectionObserver)
│   ├── Marquee.tsx     bandeaux défilants
│   ├── PageHeader.tsx  en-tête éditorial commun aux pages internes
│   ├── Logo.tsx        mark + wordmark SVG
│   ├── TrackFeed.tsx   modules "Latest on SoundCloud" (home + page artiste)
│   └── Seo.tsx         head + JSON-LD pendant la navigation SPA
├── content/
│   ├── site.ts         ← TOUT LE CONTENU CURATÉ
│   ├── sources.ts      profils SoundCloud + userId de chaque artiste
│   ├── catalog.ts      fusion curaté + synchronisé
│   └── catalog.generated.json   ← écrit par npm run sync, ne pas éditer
├── lib/
│   ├── seo.ts          ← LE GRAPHE D'ENTITÉS + les metas par route
│   └── format.ts
├── App.tsx             routes partagées client + pré-rendu
├── entry-server.tsx    entrée de pré-rendu
├── pages/              Home, Roster, ArtistPage, Releases, ReleasePage,
│                       Distribution, About, Demos, Contact, NotFound
├── index.css           design system
└── main.tsx            hydratation

scripts/
├── prerender.mjs         génère les 25 pages HTML + le sitemap
├── audit-seo.mjs         audit SEO du dist/ construit
├── serve-static.mjs      serveur local fidèle à la prod
├── sync-soundcloud.mjs   la synchro
├── resolve-user-id.mjs   résout un profil → userId
├── test-parsers.mjs      15 tests hors-ligne
└── lib/                  parsers RSS + playlists

.github/workflows/
└── sync-and-deploy.yml   job quotidien : test → sync → commit → build → deploy
```


---

## 9. Mise à jour automatique depuis SoundCloud

Le site sait aller chercher tout seul ce que les artistes publient. Concrètement :
tu postes un titre ou un album sur SoundCloud → le site le reprend au prochain build,
sans que personne ne touche au code.

### Comment ça marche

```
SoundCloud                scripts/sync-soundcloud.mjs        le site
──────────                ───────────────────────────        ───────
flux RSS public     ──►   parse + agrège              ──►    catalog.generated.json
page /sets          ──►   playlists (albums)          ──►    fusionné avec site.ts
```

Chaque artiste a un **flux RSS public** que SoundCloud génère automatiquement :

```
https://feeds.soundcloud.com/users/soundcloud:users:<userId>/sounds.rss
```

C'est la partie **stable** du système : c'est le flux podcast officiel de SoundCloud,
il ne demande ni clé d'API ni compte développeur (SoundCloud a fermé les inscriptions
à son API depuis des années — d'où ce choix). Les **playlists/albums** ne sont pas dans
le RSS : elles sont lues sur la page `/sets` du profil, ce qui est la partie **fragile**
du système. Si SoundCloud change son HTML, les albums ne remontent plus mais les titres
continuent de se synchroniser normalement.

### Les commandes

```bash
npm run sync                 # synchronise tout
npm run sync -- --dry        # simule, n'écrit rien
npm run sync -- --tracks     # titres uniquement (ignore les albums, 100 % fiable)
npm run sync -- --strict     # code de sortie 1 si un flux échoue (utilisé par le job auto)
npm test                     # teste les parsers hors-ligne (15 tests, aucun réseau)
```

### Règle de priorité

**Ce que tu écris à la main gagne toujours.** Le fichier `src/content/site.ts` reste la
référence : une sortie décrite à la main n'est jamais écrasée par la synchro. Ce qui vient
de SoundCloud et qui ne correspond à rien de curaté apparaît en plus, avec un numéro de
catalogue `SC-00x` et un petit badge `auto` sur la page Releases. Quand tu veux promouvoir
une sortie automatique en vraie entrée de catalogue, tu la recopies dans `site.ts` avec un
numéro `KD-00x` : le doublon disparaît tout seul (la correspondance se fait sur le titre).

Un même album publié sur deux profils (une collaboration) est fusionné en une seule sortie
créditée aux deux artistes.

### Ajouter un artiste à la synchro

```bash
npm run resolve -- https://soundcloud.com/nouvel_artiste
```

La commande affiche la ligne à coller dans `src/content/sources.ts`. On stocke l'`userId`
numérique plutôt que le pseudo, parce qu'il ne change jamais — même si l'artiste renomme
son profil.

**Cas particulier Chromabone** : le projet n'a pas de profil SoundCloud. Il est déclaré via
`alsoCredits: ['chromabone']` sur Nosfera Disco Club, ce qui lui fait hériter de ce flux.

### C'est déjà automatisé

`.github/workflows/deploy.yml` tourne **tous les jours à 5h12 UTC**, à chaque push sur
`main`, et à la demande. Il enchaîne : tests des parsers → synchro SoundCloud → commit du
catalogue s'il a changé → build → audit SEO → publication sur GitHub Pages.

Une panne SoundCloud ne bloque pas le déploiement : la synchro conserve le dernier
catalogue valide et le site se construit dessus. En revanche, un échec de l'audit SEO,
lui, **bloque** la publication.

### Le filet de sécurité

Le script **ne casse jamais un build**. Réseau coupé, profil privé, HTML SoundCloud modifié :
il log l'erreur, garde le dernier fichier généré valide et sort en code 0. Le site continue de
se construire avec le contenu curaté. Le fichier n'est réécrit que si le contenu a réellement
changé, pour éviter les commits vides quotidiens.

> **À valider au premier lancement.** Mon environnement n'a pas accès à `soundcloud.com`, je
> n'ai donc pas pu exécuter la synchro contre les vrais flux. Les parsers sont couverts par
> 15 tests hors-ligne et le script complet a été validé de bout en bout contre un serveur
> simulé, mais lance `npm run sync -- --dry` une première fois sur ta machine et vérifie que
> les 8 profils remontent bien le bon nombre de titres avant de brancher l'automatisation.

---

## 10. Points à valider / compléter

Les bios, localisations et titres viennent maintenant **directement des profils SoundCloud**
des artistes — ce sont leurs propres textes. Restent à valider dans `src/content/site.ts` :

- Les **numéros de catalogue** (KD-001 → KD-007) sont une convention proposée, classée par
  date de sortie croissante.
- La date de *No Saints, No Proof* (2026-03-01) est une estimation.
- L'**année de création** du label (2024) et les liens Instagram / YouTube / Spotify.
- **Love Cult** n'a pas de profil SoundCloud connu — sa fiche reste rédigée à la main et
  n'est pas synchronisée. Ajoute-la dans `sources.ts` si un profil existe.
- Les **emails** utilisent maintenant `@kinetic-distro.com` — à créer chez ton registrar
  ou à rediriger, sinon les liens `mailto:` du site pointent dans le vide.

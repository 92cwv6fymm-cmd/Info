# Somno-Gard — Apnée du sommeil, site d'information patient

Site statique d'information sur le syndrome d'apnées-hypopnées obstructives du sommeil (SAHOS), destiné aux patients et à leur entourage, édité par Somno-Gard (Dr Ghassan Fayad, dépistage ambulatoire de l'apnée du sommeil, Remoulins et Saze, Gard). Les contenus sont rédigés en français à partir de sources institutionnelles (Assurance Maladie, HAS, Inserm, Santé publique France, SPLF / SFRMS, Légifrance). Le design et les animations s'inspirent des interfaces Apple.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : chiffres clés, scrollytelling « une apnée seconde par seconde », symptômes, diagnostic, PPC, exploration du guide |
| `comprendre.html` | Définition, mécanisme, types d'apnées, curseur interactif IAH, facteurs de risque, conséquences, enfant |
| `symptomes.html` | Signes de nuit et de jour, entourage, quand consulter, test d'Epworth et questionnaire STOP-Bang interactifs (avec calcul de l'IMC), FAQ |
| `diagnostic.html` | Parcours, polygraphie et polysomnographie, déroulement, lecture des résultats, bilan complémentaire, FAQ |
| `traitements.html` | Stratégie HAS, hygiène de vie, PPC, orthèse d'avancée mandibulaire, chirurgie, autres approches, suivi, FAQ |
| `vivre-avec.html` | Quotidien avec une PPC, conduite automobile et réglementation, voyages, entourage, droits, associations |
| `sources.html` | Références complètes avec liens et mentions |

## Structure

```
assets/
  css/style.css   design system et animations
  js/main.js      interactions (navigation, apparitions, compteurs, scrollytelling, IAH, Epworth, accordéons)
  img/favicon.svg
  img/logo-somno-gard.png
sitemap.xml, robots.txt   référencement
.github/workflows/pages.yml   déploiement GitHub Pages
```

Aucune dépendance ni étape de construction : ouvrez `index.html` dans un navigateur, ou servez le dossier avec n'importe quel serveur statique (compatible GitHub Pages).

```
python3 -m http.server 8000
```

## Mise en ligne et référencement

Le site est déployé automatiquement sur GitHub Pages à chaque push (`.github/workflows/pages.yml`) :
https://92cwv6fymm-cmd.github.io/Info/

Chaque page comporte un titre et une description optimisés, une URL canonique, des balises Open Graph et un balisage JSON-LD (cabinet médical `MedicalClinic`, médecin, page médicale, fil d'Ariane, FAQ). Un `sitemap.xml` et un `robots.txt` sont fournis.

Pour utiliser un nom de domaine personnalisé (par exemple `apneedusommeil-gard.fr`) :
1. ajouter un fichier `CNAME` à la racine contenant le domaine ;
2. configurer le DNS du domaine vers GitHub Pages (enregistrement CNAME vers `92cwv6fymm-cmd.github.io`) ;
3. remplacer l'URL de base dans les balises `canonical`, `og:url`, le JSON-LD, `sitemap.xml` et `robots.txt`.

## Accessibilité

Navigation au clavier, libellés ARIA, contrastes vérifiés, respect de `prefers-reduced-motion` (les animations sont désactivées si l'utilisateur le demande).

## Avertissement

Ce site a une vocation d'information générale et ne remplace pas une consultation médicale.

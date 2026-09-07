# Apnée du sommeil — site d'information patient

Site statique d'information sur le syndrome d'apnées-hypopnées obstructives du sommeil (SAHOS), destiné aux patients et à leur entourage. Les contenus sont rédigés en français à partir de sources institutionnelles (Assurance Maladie, HAS, Inserm, Santé publique France, SPLF / SFRMS, Légifrance). Le design et les animations s'inspirent des interfaces Apple.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : chiffres clés, scrollytelling « une apnée seconde par seconde », symptômes, diagnostic, PPC, exploration du guide |
| `comprendre.html` | Définition, mécanisme, types d'apnées, curseur interactif IAH, facteurs de risque, conséquences, enfant |
| `symptomes.html` | Signes de nuit et de jour, entourage, quand consulter, test de somnolence d'Epworth interactif, FAQ |
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
```

Aucune dépendance ni étape de construction : ouvrez `index.html` dans un navigateur, ou servez le dossier avec n'importe quel serveur statique (compatible GitHub Pages).

```
python3 -m http.server 8000
```

## Accessibilité

Navigation au clavier, libellés ARIA, contrastes vérifiés, respect de `prefers-reduced-motion` (les animations sont désactivées si l'utilisateur le demande).

## Avertissement

Ce site a une vocation d'information générale et ne remplace pas une consultation médicale.

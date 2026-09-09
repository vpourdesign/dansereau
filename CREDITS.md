# Prototype Accueil — crédits médias et notes

Prototype statique (étape 1 du processus de build, voir `../../ARCHITECTURE.md` §7).
Ouvrir avec le serveur local du projet : `python3 -m http.server 3456` à la racine DANSEREAU,
puis http://127.0.0.1:3456/prototypes/accueil/

## Stack
- Design system : `../../design-system/styles.css` (tokens, reset, `.mono`, `.sombre`)
- GSAP 3.13 + ScrollTrigger + SplitText (cdnjs), Lenis 1.1.18 (jsdelivr), Three.js 0.169 (jsdelivr, module)
- Aucun build. Pour la conversion WordPress : `index.html` → templates, `css/accueil.css` → `assets/`, `js/*` → `assets/`.

## Médias de remplacement (licence Pexels, gratuits, sans attribution requise)
Tous chargés en direct depuis le CDN Pexels. À remplacer par les photos et la vidéo du client.

| Emplacement | Type | Pexels | Auteur |
|---|---|---|---|
| Hero (vidéo) | Vidéo 5498746 | https://www.pexels.com/video/person-serving-a-meal-5498746/ | Bonus Studio |
| Hero (affiche) | Image du même clip | https://images.pexels.com/videos/5498746/pexels-photo-5498746.jpeg | Bonus Studio |
| Carte 01 Évènements | Photo 34618729 | https://www.pexels.com/photo/34618729/ | Novkov Visuals |
| Carte 02 Corporatifs | Photo 18749086 | https://www.pexels.com/photo/18749086/ | micklatter |
| Carte 03 Mariages | Photo 35985203 | https://www.pexels.com/photo/35985203/ | Jonathan Borba |
| Carte 04 Réceptions privées | Photo 30151915 | https://www.pexels.com/photo/30151915/ | Leticia Alvares |
| Carte 05 Galerie | Photo 28705621 | https://www.pexels.com/photo/28705621/ | Filipp Romanovski |
| Carte 06 À propos | Photo 15671274 | https://www.pexels.com/photo/15671274/ | Luis Becerra Fotógrafo |
| Bande citation | Photo 29703684 | https://www.pexels.com/photo/29703684/ | Valerie |
| Split À propos | Photo 36430075 | https://www.pexels.com/photo/36430075/ | Willians Huerta |
| Menu, vignette 1 | Photo 13375022 | https://www.pexels.com/photo/13375022/ | Lebele |
| Menu, vignette 2 | Photo 30235759 | https://www.pexels.com/photo/30235759/ | Fabrice Busching |

Autres clips candidats pour le hero : 5498733 (service d'une bouchée), 5498730 (vin versé, ambiance sombre),
5498731 (assiette déposée), 8765010 (verres et vin). Même schéma d'URL sur videos.pexels.com.

## Contenus à confirmer avec le client
- Adresse civique et courriel du pied de page (placeholders).
- Liens réseaux sociaux (Instagram, Facebook, LinkedIn).
- Textes des 6 univers et de l'intro (rédaction provisoire, ton du DESIGN.md).
- Zone de service et délai de réponse annoncés dans la section Soumission.

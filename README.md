# Dansereau Traiteur, prototype du site

Prototype HTML statique de la page d'accueil de dansereau.com, livré par V pour Design. Il sert de référence visuelle et de motion avant la conversion en thème WordPress.

## Ouvrir en local

```bash
python3 -m http.server 3456
```

Puis http://localhost:3456/ dans le navigateur. Le prototype charge GSAP, Lenis et Three.js depuis des CDN, il faut donc une connexion.

## Contenu

- `index.html`, `css/`, `js/`, `assets/` : la page d'accueil (hero vidéo, menu overlay, six univers, bande, à propos, soumission, pied de page).
- `design-system/` : tokens et styles de base du design system Dansereau (couleurs, typographie, espacements).
- `CREDITS.md` : liste des médias Pexels utilisés comme placeholders, à remplacer par les photos et la vidéo du client.

## Notes

- L'adresse civique, le courriel et les liens sociaux du pied de page sont des placeholders.
- La source de travail reste le dossier projet DANSEREAU (`prototypes/accueil/` et `design-system/`). Ce dépôt en est la copie publiée.

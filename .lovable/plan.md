## Refonte tunnel de réservation Caby Van — 7 étapes style Ryanair

### Étapes actuelles → Nouvelles étapes
- hero → search → results → seat+extras → confirm
- **Nouveau** : hero → search → results(véhicule) → seat → extras → passenger → payment → confirm

### Changements concrets

**1. Mise à jour du Step type et du Stepper**
- `Step = 'hero' | 'search' | 'results' | 'seat' | 'extras' | 'passenger' | 'payment' | 'confirm'`
- Stepper 7 étapes avec labels adaptés

**2. Technique Ryanair #1 — Calendrier avec prix par jour**
- Sur l'étape search, transformer le date picker pour afficher les prix sous chaque date
- Prix vert (creux/early bird), orange (standard), rouge (rush/derniers sièges)

**3. Technique Ryanair #2 — Siège visuel (étape 3)**
- Séparer la sélection de siège des extras
- Le plan VAN 7 places reste, mais devient une étape dédiée

**4. Technique Ryanair #3 — Extras au bon moment (étape 4)**
- AncillarySelector déplacé dans sa propre étape APRÈS le siège
- Ajout assurance trajet dans les extras

**5. Nouvelle étape 5 — Informations passager**
- Formulaire : Prénom, Nom, Téléphone, Email
- Si aéroport détecté : champ numéro de vol
- Nombre de bagages

**6. Nouvelle étape 6 — Paiement**
- Récap total complet (siège + extras + assurance)
- Boutons Stripe / TWINT / Apple Pay (simulés MVP)
- Mention légale covoiturage

**7. Étape 7 — Confirmation enrichie**
- E-ticket avec QR code
- Bouton "Ajouter au calendrier"
- Bouton "Télécharger PDF"

### Fichiers modifiés
- `src/pages/rider/CabyVanPage.tsx` — refonte principale

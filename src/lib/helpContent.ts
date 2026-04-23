// Catalogue des articles d'aide Caby — structure inspirée easyJet
// 5 catégories principales, sous-liens cliquables vers articles dédiés

export type HelpArticle = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
  relatedSlugs?: string[];
  cta?: { label: string; to: string };
};

export type HelpCategory = {
  id: string;
  title: string;
  iconName: 'BookmarkCheck' | 'Luggage' | 'Car' | 'Tag' | 'ShieldAlert';
  articles: HelpArticle[];
};

export const HELP_CATEGORIES: HelpCategory[] = [
  // ============= 1. RÉSERVATION & ENREGISTREMENT =============
  {
    id: 'reservation',
    title: 'Réservation & enregistrement',
    iconName: 'BookmarkCheck',
    articles: [
      {
        slug: 'compte-caby',
        title: 'Compte Caby',
        intro: 'Créer, gérer et sécuriser votre compte personnel Caby en quelques minutes.',
        sections: [
          { heading: 'Créer un compte', body: 'L\'inscription se fait par email ou numéro de téléphone (vérification OTP par SMS). Aucune carte bancaire n\'est demandée à la création.' },
          { heading: 'Mot de passe oublié', body: 'Cliquez sur « Mot de passe oublié » sur l\'écran de connexion. Un lien de réinitialisation est envoyé à votre email vérifié.' },
          { heading: 'Sécurité du compte', body: 'Activez la double authentification dans Paramètres > Sécurité. Caby ne vous demandera jamais votre mot de passe par téléphone.' },
        ],
        cta: { label: 'Accéder aux paramètres', to: '/caby/account/settings' },
        relatedSlugs: ['gerer-reservation', 'enregistrement'],
      },
      {
        slug: 'gerer-reservation',
        title: 'Gérer votre réservation',
        intro: 'Modifier, annuler ou consulter vos courses et trajets Van à venir.',
        sections: [
          { heading: 'Modifier une réservation', body: 'Rendez-vous dans « Mes réservations » et sélectionnez le trajet concerné. Les modifications gratuites incluent : nom, faute d\'orthographe, ajout passager (selon dispo).' },
          { heading: 'Frais de modification', body: 'La majorité des changements (date, horaire, destination) sont gratuits si effectués 24h avant le départ. Au-delà, des frais peuvent s\'appliquer.', bullets: ['+24h : gratuit', '24h–6h : CHF 10', '< 6h : non modifiable'] },
          { heading: 'Annulation', body: 'Voir l\'article « Annulation de votre trajet » pour le détail des remboursements.' },
        ],
        cta: { label: 'Voir mes réservations', to: '/caby/account/reservations' },
        relatedSlugs: ['annulation', 'changer-vol'],
      },
      {
        slug: 'destinations-tarifs',
        title: 'Nos destinations & tarifs',
        intro: 'Toutes les villes desservies par Caby Van et la grille tarifaire transparente.',
        sections: [
          { heading: 'Destinations Caby Van', body: 'Réseau Léman + cross-border : Genève, Lausanne, Annecy, Chamonix, Évian, Annemasse, Bonneville, Thonon, Zermatt et stations de ski. Plus de 40 destinations actives.' },
          { heading: 'Tarification dynamique', body: 'Les prix varient selon l\'heure (Rush/Creux/Calme), le remplissage et la date. Réservez tôt pour bénéficier du tarif minimum.' },
          { heading: 'Caby Pass', body: 'L\'abonnement Voyageur (29 CHF/mois) offre -10% sur tous les trajets et l\'accès aux Flash Deals.' },
        ],
        cta: { label: 'Explorer les destinations', to: '/caby/van/inspire' },
        relatedSlugs: ['caby-pass', 'flash-deals'],
      },
      {
        slug: 'choisir-siege',
        title: 'Choisir un siège',
        intro: 'Sélectionnez votre place dans le Mercedes Classe V (7 passagers).',
        sections: [
          { heading: 'Configuration intérieure', body: 'Le véhicule comprend 3 rangs : avant (1 passager), milieu (3 sièges), arrière (3 sièges). Toutes les places disposent de prises USB et de l\'air conditionné.' },
          { heading: 'Tarif siège préférentiel', body: 'Le choix de siège est une option à +5 CHF. Les passagers Caby Pass Voyageur+ bénéficient du choix gratuit.' },
          { heading: 'Sièges enfants', body: 'Disponibles sur demande lors de la réservation (gratuit, 0-7 ans). Limite de 2 sièges par véhicule.' },
        ],
        cta: { label: 'Réserver un trajet', to: '/caby/van' },
        relatedSlugs: ['enfants', 'gerer-reservation'],
      },
      {
        slug: 'enregistrement',
        title: 'Enregistrement',
        intro: 'Présentation au point de rendez-vous et processus d\'embarquement.',
        sections: [
          { heading: 'Avant le départ', body: 'Présentez-vous au point de rendez-vous 10 minutes avant l\'horaire. Le QR code de votre billet est requis pour l\'embarquement.' },
          { heading: 'Tolérance de retard', body: 'Le chauffeur attend 5 minutes après l\'horaire annoncé. Au-delà, le départ peut s\'effectuer sans vous (no-show).' },
          { heading: 'Documents requis', body: 'Pour les trajets cross-border (FR/CH), une pièce d\'identité valide est obligatoire.' },
        ],
        relatedSlugs: ['gerer-reservation', 'documents-voyage'],
      },
      {
        slug: 'groupes',
        title: 'Groupes',
        intro: 'Réservation pour groupes de 5 personnes ou plus.',
        sections: [
          { heading: 'Groupes 5–7 personnes', body: 'Réservez l\'intégralité du véhicule (privatisation). Tarif fixe sans surcoût par passager additionnel.' },
          { heading: 'Groupes 8+ personnes', body: 'Plusieurs véhicules en convoi. Contactez notre service Groupes pour un devis personnalisé.' },
          { heading: 'Avantages groupes', body: 'Bagages inclus, points de prise en charge personnalisés, facture unique avec TVA.', bullets: ['Devis sous 24h', 'Acompte 30%', 'Annulation flexible jusqu\'à J-7'] },
        ],
        cta: { label: 'Demander un devis', to: '/caby/help/contact' },
      },
      {
        slug: 'changer-vol',
        title: 'Changer de trajet et de nom',
        intro: 'Modifications de date, horaire, destination ou nom du passager.',
        sections: [
          { heading: 'Changer le nom du passager', body: 'Gratuit jusqu\'à 24h avant le départ via « Mes réservations ». Les fautes d\'orthographe sont corrigées sans frais à tout moment.' },
          { heading: 'Changer la date / l\'horaire', body: 'Disponible sous réserve de places. La différence tarifaire éventuelle est facturée.' },
          { heading: 'Changer la destination', body: 'Possible dans la même région. Pour un changement majeur, l\'annulation/re-réservation peut être plus avantageuse.' },
        ],
        relatedSlugs: ['gerer-reservation', 'annulation'],
      },
      {
        slug: 'annulation',
        title: 'Annulation de votre trajet',
        intro: 'Politique de remboursement échelonnée selon le délai d\'annulation.',
        sections: [
          { heading: 'Barème de remboursement', body: 'Les remboursements sont calculés en fonction du temps restant avant le départ.', bullets: ['+72h : 100%', '72h–48h : 80%', '48h–24h : 60%', '24h–6h : 40%', '6h–1h : 20%', '< 1h : 0%'] },
          { heading: 'Option Annulation Flexible', body: 'Ajoutez +9 CHF à la réservation pour bénéficier d\'un remboursement à 100% jusqu\'à 1h avant le départ.' },
          { heading: 'Méthode de remboursement', body: 'Le remboursement est crédité sur le moyen de paiement original (3-5 jours ouvrés) ou sur votre Caby Wallet (instantané).' },
        ],
        cta: { label: 'Annuler une réservation', to: '/caby/account/reservations' },
        relatedSlugs: ['gerer-reservation', 'paiement-tva'],
      },
      {
        slug: 'paiement-tva',
        title: 'Confirmation de paiement avec TVA',
        intro: 'Téléchargez vos factures et reçus officiels avec TVA suisse 8.1%.',
        sections: [
          { heading: 'Télécharger une facture', body: 'Toutes les factures sont disponibles dans « Mes réservations » > facture PDF, dès la confirmation du paiement.' },
          { heading: 'Mention TVA', body: 'Caby est assujetti à la TVA suisse (CHE-XXX.XXX.XXX TVA). Le taux applicable est de 8.1% pour les transports.' },
          { heading: 'Facture professionnelle', body: 'Pour ajouter une raison sociale et un numéro TVA d\'entreprise, modifiez votre profil dans Paramètres > Facturation pro.' },
        ],
        cta: { label: 'Mes paramètres facturation', to: '/caby/account/settings' },
      },
    ],
  },

  // ============= 2. BAGAGES =============
  {
    id: 'bagages',
    title: 'Bagages',
    iconName: 'Luggage',
    articles: [
      {
        slug: 'bagage-main',
        title: 'Bagage à main',
        intro: 'Un sac cabine inclus gratuitement par passager.',
        sections: [
          { heading: 'Dimensions autorisées', body: '55 × 40 × 20 cm maximum, 8 kg. Doit pouvoir être placé sous le siège avant ou sur les genoux.' },
          { heading: 'Objets personnels', body: 'En complément, un objet personnel (sac à main, ordinateur portable) est autorisé sans surcoût.' },
        ],
        relatedSlugs: ['grande-valise', 'objets-perdus'],
      },
      {
        slug: 'grande-valise',
        title: 'Grande valise',
        intro: 'Option grande valise à +8 CHF (Caby Van n\'a pas de soute, espace coffre limité).',
        sections: [
          { heading: 'Dimensions et limite', body: 'Valise jusqu\'à 75 × 50 × 30 cm, 23 kg. Limité à 1 grande valise par passager (capacité coffre).' },
          { heading: 'Réserver l\'option', body: 'Ajoutez « Grande valise » lors de la réservation (étape Options). Réservation 6h avant le départ minimum.' },
          { heading: 'Pas de soute', body: 'Le Mercedes Classe V dispose d\'un coffre arrière (pas d\'espace soute). Le nombre total de grosses valises est limité à 5 par véhicule.' },
        ],
        cta: { label: 'Réserver avec valise', to: '/caby/van' },
        relatedSlugs: ['equipement-sportif', 'bagage-main'],
      },
      {
        slug: 'equipement-sportif',
        title: 'Équipement sportif',
        intro: 'Skis, snowboard, vélo, golf : options spécifiques.',
        sections: [
          { heading: 'Skis / Snowboard', body: 'Option +12 CHF. Réservez via les options « Pack Ski ». Disponible uniquement sur les destinations alpines.' },
          { heading: 'Vélo', body: 'Vélo démonté en housse uniquement. Option +15 CHF. Limite de 2 vélos par véhicule.' },
          { heading: 'Golf', body: 'Sac de golf : +10 CHF. À déclarer au moment de la réservation.' },
        ],
        cta: { label: 'Voir Pack Ski', to: '/caby/van/ski' },
      },
      {
        slug: 'instruments-musique',
        title: 'Instruments de musique',
        intro: 'Transport sécurisé pour les musiciens.',
        sections: [
          { heading: 'Petits instruments', body: 'Violon, flûte, guitare en housse : autorisés en bagage à main sans surcoût.' },
          { heading: 'Grands instruments', body: 'Violoncelle, contrebasse : siège dédié à acheter (tarif passager). Contactez le support pour validation.' },
        ],
        cta: { label: 'Contacter le support', to: '/caby/help/contact' },
      },
      {
        slug: 'articles-restreints',
        title: 'Articles restreints',
        intro: 'Liste des objets interdits ou nécessitant une autorisation.',
        sections: [
          { heading: 'Strictement interdits', body: 'Armes, explosifs, produits inflammables, gaz comprimés, substances toxiques.', bullets: ['Armes à feu', 'Bouteilles de gaz', 'Liquides inflammables', 'Produits chimiques'] },
          { heading: 'Sous conditions', body: 'Médicaments (avec ordonnance pour > 100ml), animaux (sur demande, voir article dédié), batteries lithium > 100Wh.' },
          { heading: 'Alcool & tabac', body: 'Quantités personnelles autorisées. Pas de consommation pendant le trajet.' },
        ],
      },
      {
        slug: 'objets-perdus',
        title: 'Bagage endommagé ou retardé et objets perdus',
        intro: 'Que faire en cas de problème avec vos affaires.',
        sections: [
          { heading: 'Objet oublié à bord', body: 'Signalez l\'oubli sous 24h via le formulaire de contact. Nous coordonnons avec le chauffeur pour retrouver l\'objet.' },
          { heading: 'Bagage endommagé', body: 'Constatez les dégâts immédiatement à la descente et photographiez. Déclaration sous 7 jours pour indemnisation.' },
          { heading: 'Indemnisation', body: 'Jusqu\'à 500 CHF par bagage en cas de responsabilité Caby (assurance incluse).' },
        ],
        cta: { label: 'Déclarer un objet perdu', to: '/caby/help/contact' },
      },
    ],
  },

  // ============= 3. PENDANT LE TRAJET =============
  {
    id: 'trajet',
    title: 'Pendant le trajet',
    iconName: 'Car',
    articles: [
      {
        slug: 'documents-voyage',
        title: 'Documents de voyage & info',
        intro: 'Pièces d\'identité requises selon votre trajet.',
        sections: [
          { heading: 'Trajets domestiques (Suisse)', body: 'Aucun document requis. Le QR code du billet suffit.' },
          { heading: 'Cross-border (Suisse ↔ France)', body: 'Carte d\'identité ou passeport en cours de validité obligatoire pour tous les passagers, y compris enfants.' },
          { heading: 'Mineurs voyageant seuls', body: 'Autorisation parentale requise pour les passagers de moins de 16 ans non accompagnés.' },
        ],
        relatedSlugs: ['enfants', 'enregistrement'],
      },
      {
        slug: 'services-bord',
        title: 'Services à bord',
        intro: 'Confort et services inclus dans votre trajet Caby Van.',
        sections: [
          { heading: 'Inclus gratuitement', body: 'Wi-Fi haut débit, prises USB-C par siège, eau minérale, climatisation 3 zones, chargeur sans fil avant.' },
          { heading: 'À la demande', body: 'Couverture (hiver), boisson chaude (option +3 CHF), playlist personnalisée Spotify.' },
          { heading: 'Silence ou conversation', body: 'Lors de la réservation, indiquez « Trajet calme » pour signaler au chauffeur votre préférence.' },
        ],
        relatedSlugs: ['enfants', 'assistance-speciale'],
      },
      {
        slug: 'enfants',
        title: 'Voyager avec des enfants',
        intro: 'Sièges enfants, tarifs spéciaux et règles de sécurité.',
        sections: [
          { heading: 'Sièges enfants gratuits', body: 'Sur demande lors de la réservation : 0-1 an (coque), 1-4 ans (siège), 4-12 ans (rehausseur). Limite 2 par véhicule.' },
          { heading: 'Tarifs enfants', body: 'Gratuit pour les 0-2 ans (sur les genoux). Tarif adulte standard à partir de 3 ans (siège dédié obligatoire).' },
          { heading: 'Mineurs non accompagnés', body: 'Service possible dès 12 ans avec autorisation parentale. Le chauffeur s\'assure de la prise en charge à destination.' },
        ],
        relatedSlugs: ['choisir-siege', 'documents-voyage'],
      },
      {
        slug: 'assistance-speciale',
        title: 'Assistance spéciale',
        intro: 'Mobilité réduite, fauteuil roulant, animaux d\'assistance.',
        sections: [
          { heading: 'Fauteuil roulant', body: 'Caby Van peut accueillir un fauteuil pliable dans le coffre. Pour les fauteuils électriques, contactez le support 48h avant.' },
          { heading: 'Animaux d\'assistance', body: 'Acceptés gratuitement et sans déclaration préalable, à condition de présenter la carte d\'identification de l\'animal.' },
          { heading: 'Aide à l\'embarquement', body: 'Le chauffeur est formé pour assister les personnes à mobilité réduite. Service gratuit, à demander à la réservation.' },
        ],
        cta: { label: 'Réserver une assistance', to: '/caby/van/assistance' },
      },
      {
        slug: 'assistance-medicale',
        title: 'Assistance médicale',
        intro: 'Voyager avec des conditions médicales particulières.',
        sections: [
          { heading: 'Médicaments', body: 'Tous les médicaments personnels sont autorisés. Conservez ordonnance et certificat pour les contrôles cross-border.' },
          { heading: 'Oxygène médical', body: 'Bouteille personnelle acceptée sous certificat médical. Déclaration obligatoire à la réservation.' },
          { heading: 'Grossesse', body: 'Aucune restriction. Conseillé d\'avoir un certificat médical au-delà de 36 semaines.' },
        ],
      },
      {
        slug: 'retards-annulations',
        title: 'Retards & annulations',
        intro: 'Vos droits en cas de retard ou annulation par Caby.',
        sections: [
          { heading: 'Retard supérieur à 30 min', body: 'Notification automatique, possibilité de remboursement intégral ou de re-réservation gratuite sur le créneau suivant.' },
          { heading: 'Annulation par Caby', body: 'Remboursement intégral + bon de 20 CHF sur votre prochain trajet (Caby Wallet).' },
          { heading: 'Compensation no-show chauffeur', body: 'Si le chauffeur ne se présente pas : 100% remboursé + course de remplacement Uber/taxi prise en charge jusqu\'à 50 CHF.' },
        ],
        cta: { label: 'Voir l\'état du trafic', to: '/caby/help/trafic' },
        relatedSlugs: ['annulation'],
      },
    ],
  },

  // ============= 4. AUTRES SERVICES =============
  {
    id: 'autres',
    title: 'Autres services',
    iconName: 'Tag',
    articles: [
      {
        slug: 'caby-pass',
        title: 'Caby Pass — abonnement',
        intro: 'Trois formules pour économiser sur vos trajets réguliers.',
        sections: [
          { heading: 'Découverte (gratuit)', body: 'Accès standard à tous les services Caby. Tarification publique.' },
          { heading: 'Voyageur (29 CHF/mois)', body: '-10% sur tous les trajets, accès aux Flash Deals, choix de siège gratuit, annulation flexible incluse.' },
          { heading: 'Voyageur+ (89 CHF/mois)', body: 'Tous les avantages Voyageur + -20% Cross-border, priorité d\'embarquement, surclassement Premium offert (selon dispo).' },
        ],
        cta: { label: 'S\'abonner à Caby Pass', to: '/caby/pass' },
      },
      {
        slug: 'caby-business',
        title: 'Caby Business',
        intro: 'Solution dédiée aux entreprises et déplacements professionnels.',
        sections: [
          { heading: 'Compte entreprise', body: 'Centralisation des réservations collaborateurs, facture unique mensuelle, dashboard d\'analyse.' },
          { heading: 'Avantages', body: 'Tarifs négociés, mode silencieux par défaut, factures TVA pré-remplies avec votre raison sociale.' },
          { heading: 'Démo & contact', body: 'Notre équipe Sales vous présente le produit en 30 minutes.' },
        ],
        cta: { label: 'Découvrir Business', to: '/business' },
      },
      {
        slug: 'caby-night',
        title: 'Caby Night',
        intro: 'Service de nuit (22h–06h) avec chauffeurs certifiés.',
        sections: [
          { heading: 'Surcoût', body: '+30% sur le tarif Ride standard de 22h00 à 06h00 (compense les conditions de nuit).' },
          { heading: 'Chauffeurs Night', body: 'Sélectionnés pour leur expérience nocturne, formés à la sécurité passagère et au protocole anti-incident.' },
          { heading: 'Sécurité renforcée', body: 'Activation automatique du partage de trajet avec contacts de confiance. Bouton SOS prioritaire.' },
        ],
        cta: { label: 'Réserver Caby Night', to: '/caby/night' },
      },
      {
        slug: 'cross-border',
        title: 'Cross-border (Suisse ↔ France)',
        intro: 'Trajets transfrontaliers conformes aux régulations VTC FR/CH.',
        sections: [
          { heading: 'Routes desservies', body: 'Genève ↔ Annecy, Chamonix, Évian, Annemasse. Tarif fixe ou covoiturage selon disponibilité.' },
          { heading: 'Conformité légale', body: 'Tous nos chauffeurs disposent des autorisations VTC FR + CH. Assurance internationale incluse (+2.50 CHF/trajet).' },
          { heading: 'Documents requis', body: 'Carte d\'identité ou passeport en cours de validité obligatoire pour tous les passagers.' },
        ],
        cta: { label: 'Réserver un trajet cross-border', to: '/caby/van/crossborder' },
      },
      {
        slug: 'flash-deals',
        title: 'Flash Deals',
        intro: 'Sièges à prix cassés tous les lundis et jeudis à 9h.',
        sections: [
          { heading: 'Comment ça marche', body: 'Chaque lundi et jeudi à 9h00, des sièges sur les routes les moins remplies sont mis en vente avec -30% à -60%.' },
          { heading: 'Conditions', body: 'Stock limité, premier arrivé premier servi. Modifiables avec frais, non remboursables.' },
          { heading: 'Notification', body: 'Activez les notifications Flash Deals dans Paramètres > Notifications pour être alerté.' },
        ],
        cta: { label: 'Voir les Flash Deals', to: '/caby/van' },
      },
      {
        slug: 'wallet-paiement',
        title: 'Caby Wallet & moyens de paiement',
        intro: 'Twint, Apple Pay, Google Pay, cartes bancaires et solde Caby.',
        sections: [
          { heading: 'Moyens acceptés', body: 'Twint (instantané), Apple Pay, Google Pay, Visa/Mastercard/Amex, virement bancaire (Business uniquement).' },
          { heading: 'Caby Wallet', body: 'Crédit interne rechargeable (Twint Cash). Bonus +5% à chaque recharge > 100 CHF.' },
          { heading: 'Sécurité', body: 'Tokenisation des cartes (PCI DSS), aucun numéro stocké en clair. 3D Secure activé par défaut.' },
        ],
        cta: { label: 'Mon portefeuille', to: '/caby/account/wallet' },
      },
    ],
  },

  // ============= 5. SÉCURITÉ & URGENCE =============
  {
    id: 'securite',
    title: 'Sécurité & urgence',
    iconName: 'ShieldAlert',
    articles: [
      {
        slug: 'centre-securite',
        title: 'Centre de sécurité',
        intro: 'Tous les outils de sécurité passager Caby en un seul endroit.',
        sections: [
          { heading: '7 modules disponibles', body: 'Préférences sécurité, contacts de confiance, vérification trajet, RideCheck (anomalies GPS), conseils, sécurité ados, à propos.' },
          { heading: 'Bouton SOS', body: 'Disponible sur tous les écrans pendant un trajet. Connexion directe au support et aux services d\'urgence (police 117, ambulance 144).' },
        ],
        cta: { label: 'Ouvrir le centre de sécurité', to: '/caby/account/safety' },
        relatedSlugs: ['contacts-confiance', 'verifier-trajet'],
      },
      {
        slug: 'contacts-confiance',
        title: 'Contacts de confiance',
        intro: 'Partagez automatiquement vos trajets avec vos proches.',
        sections: [
          { heading: 'Limite de contacts', body: 'Jusqu\'à 5 contacts de confiance enregistrés. Ils reçoivent par SMS le lien de suivi en temps réel à chaque trajet.' },
          { heading: 'Activation automatique', body: 'Activez le partage permanent (tous les trajets) ou le partage manuel (au cas par cas).' },
          { heading: 'Confidentialité', body: 'Vos contacts ne voient que le trajet en cours et l\'ETA. Aucun historique partagé.' },
        ],
        cta: { label: 'Gérer mes contacts', to: '/caby/account/safety/contacts' },
      },
      {
        slug: 'verifier-trajet',
        title: 'Vérifier mon trajet',
        intro: 'Confirmez l\'identité du chauffeur et du véhicule avant de monter.',
        sections: [
          { heading: 'Vérification PIN', body: 'Le chauffeur vous communique un PIN à 4 chiffres affiché dans votre app. Si le PIN ne correspond pas, ne montez pas.' },
          { heading: 'Vérification plaque', body: 'L\'app affiche la plaque du véhicule + photo. Vérifiez systématiquement avant l\'embarquement.' },
          { heading: 'Photo chauffeur', body: 'Photo officielle visible dans l\'app pendant tout le trajet.' },
        ],
        cta: { label: 'Activer la vérification', to: '/caby/account/safety/verify' },
      },
      {
        slug: 'incidents',
        title: 'Signaler un incident',
        intro: 'Procédure de signalement et compensation automatique.',
        sections: [
          { heading: '7 types d\'incidents', body: 'Maladie passager, panne véhicule, no-show chauffeur, accident, retard frontière, retard chauffeur > 15 min, comportement inapproprié.' },
          { heading: 'Compensation automatique', body: 'Selon le type, compensation immédiate sur Caby Wallet : remboursement partiel/total + bon trajet futur.' },
          { heading: 'Suivi du dossier', body: 'Réponse sous 24h. Médiation interne avec le chauffeur. Possibilité d\'escalade auprès du service Conformité.' },
        ],
        cta: { label: 'Signaler maintenant', to: '/caby/help/contact' },
      },
      {
        slug: 'securite-ados',
        title: 'Sécurité des adolescents',
        intro: 'Trajets sécurisés pour les passagers de 12 à 17 ans.',
        sections: [
          { heading: 'Conditions', body: 'Compte parental obligatoire (Caby Family). Le parent réserve, l\'ado utilise un PIN unique à l\'embarquement.' },
          { heading: 'Suivi parental', body: 'Notification automatique au parent : embarquement, position en temps réel, arrivée. Possibilité d\'appeler le chauffeur.' },
          { heading: 'Chauffeurs certifiés', body: 'Trajets ados attribués uniquement aux chauffeurs SuperDriver Gold avec formation spécifique.' },
        ],
        cta: { label: 'Sécurité ados', to: '/caby/account/safety/teen' },
      },
    ],
  },
];

// FAQ rapides affichées sur le hub
export const HELP_FAQ_QUICK = [
  { title: 'Dernières informations de trajet', desc: 'État du trafic et alertes en temps réel', to: '/caby/help/trafic' },
  { title: 'Besoin de modifier votre réservation ?', desc: 'Quelles modifications sont possibles et comment y parvenir', to: '/caby/help/article/gerer-reservation' },
  { title: 'Retards de trajet', desc: 'Que faire si votre trajet est affecté', to: '/caby/help/article/retards-annulations' },
  { title: 'Explications sur les bagages', desc: 'Tout ce que vous devez savoir sur ce que vous pouvez prendre avec vous', to: '/caby/help/article/grande-valise' },
];

export function findArticle(slug: string): { article: HelpArticle; category: HelpCategory } | null {
  for (const cat of HELP_CATEGORIES) {
    const found = cat.articles.find(a => a.slug === slug);
    if (found) return { article: found, category: cat };
  }
  return null;
}

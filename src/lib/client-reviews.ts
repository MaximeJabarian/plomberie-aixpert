/** Avis clients affichés sur la page d’accueil (accordéon). */
export type ClientReview = { name: string; city: string; text: string };

export const CLIENT_REVIEWS: ClientReview[] = [
  { name: "Sophie M.", city: "Aix-en-Provence", text: "Intervention en 30 minutes pour une fuite urgente. Travail propre, prix juste. Je recommande à 100%." },
  { name: "Jean-Luc P.", city: "Le Tholonet", text: "Très professionnel. A pris le temps d'expliquer le problème et la solution. Devis respecté." },
  { name: "Marie D.", city: "Venelles", text: "Installation d'un chauffe-eau impeccable. Ponctuel, soigneux, à l'écoute. Merci !" },
  { name: "Karim B.", city: "Bouc-Bel-Air", text: "Débouchage rapide et efficace, après plusieurs tentatives ratées avec d'autres. Enfin un vrai pro." },
  { name: "Hélène R.", city: "Aix-en-Provence", text: "Rénovation complète de notre salle de bain. Résultat magnifique, dans les délais. Bravo." },
  { name: "Thomas L.", city: "Puyricard", text: "Disponible un dimanche soir pour une fuite. Réactif, transparent sur les tarifs. Top." },
];

export const CLIENT_REVIEWS_RATING_SCORE = "5,0/5";
export const CLIENT_REVIEWS_RATING_DETAIL = "66 avis sur Google";

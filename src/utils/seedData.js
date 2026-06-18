import { db } from '../config/firebase';
import firebase from 'firebase/compat/app';

const TS = firebase.firestore.FieldValue.serverTimestamp;

const CONDUCTEURS = [
  { id: 'demo_user_1', nom: 'Sophie Martin' },
  { id: 'demo_user_2', nom: 'Lucas Bernard' },
  { id: 'demo_user_3', nom: 'Camille Dubois' },
];

const TRAJETS = [
  { depart: 'Paris',     arrivee: 'Lyon',       date: '25/07/2026', heure: '07:30', places: 3, prix: 28, conducteur: 0 },
  { depart: 'Paris',     arrivee: 'Lyon',       date: '26/07/2026', heure: '09:00', places: 2, prix: 25, conducteur: 1 },
  { depart: 'Lyon',      arrivee: 'Marseille',  date: '25/07/2026', heure: '10:00', places: 4, prix: 20, conducteur: 2 },
  { depart: 'Paris',     arrivee: 'Bordeaux',   date: '27/07/2026', heure: '08:00', places: 3, prix: 35, conducteur: 0 },
  { depart: 'Bordeaux',  arrivee: 'Nantes',     date: '28/07/2026', heure: '11:00', places: 2, prix: 22, conducteur: 1 },
  { depart: 'Marseille', arrivee: 'Nice',       date: '25/07/2026', heure: '14:00', places: 3, prix: 15, conducteur: 2 },
  { depart: 'Paris',     arrivee: 'Strasbourg', date: '29/07/2026', heure: '06:30', places: 4, prix: 30, conducteur: 0 },
  { depart: 'Lyon',      arrivee: 'Paris',      date: '26/07/2026', heure: '16:00', places: 2, prix: 27, conducteur: 1 },
  { depart: 'Nantes',    arrivee: 'Paris',      date: '27/07/2026', heure: '07:00', places: 3, prix: 32, conducteur: 2 },
  { depart: 'Paris',     arrivee: 'Lille',      date: '25/07/2026', heure: '08:30', places: 4, prix: 18, conducteur: 0 },
];

export async function seedDatabase(currentUserId, currentUserNom) {
  const batch = db.batch();
  let count = 0;

  for (const t of TRAJETS) {
    const c = CONDUCTEURS[t.conducteur];
    const ref = db.collection('trajets').doc();
    batch.set(ref, {
      conducteurId:       c.id,
      conducteurNom:      c.nom,
      depart:             t.depart,
      departLower:        t.depart.toLowerCase(),
      arrivee:            t.arrivee,
      arriveLower:        t.arrivee.toLowerCase(),
      date:               t.date,
      heure:              t.heure,
      places:             t.places,
      placesDisponibles:  t.places,
      prix:               t.prix,
      statut:             'actif',
      createdAt:          TS(),
    });
    count++;
  }

  // 2 trajets publiés par l'utilisateur connecté
  const mesVilles = [
    { depart: 'Paris', arrivee: 'Lyon',     date: '30/07/2026', heure: '08:00', places: 3, prix: 26 },
    { depart: 'Lyon',  arrivee: 'Bordeaux', date: '31/07/2026', heure: '09:30', places: 2, prix: 24 },
  ];

  for (const t of mesVilles) {
    const ref = db.collection('trajets').doc();
    batch.set(ref, {
      conducteurId:       currentUserId,
      conducteurNom:      currentUserNom,
      depart:             t.depart,
      departLower:        t.depart.toLowerCase(),
      arrivee:            t.arrivee,
      arriveLower:        t.arrivee.toLowerCase(),
      date:               t.date,
      heure:              t.heure,
      places:             t.places,
      placesDisponibles:  t.places,
      prix:               t.prix,
      statut:             'actif',
      createdAt:          TS(),
    });
    count++;
  }

  // Profils des conducteurs démo
  for (const c of CONDUCTEURS) {
    const ref = db.collection('users').doc(c.id);
    batch.set(ref, {
      nom:             c.nom.split(' ')[1],
      prenom:          c.nom.split(' ')[0],
      email:           `${c.nom.toLowerCase().replace(' ', '.')}@demo.fr`,
      noteMoyenne:     (Math.random() * 2 + 3).toFixed(1),
      nombreNotations: Math.floor(Math.random() * 20 + 5),
      kmTotal:         Math.floor(Math.random() * 2000 + 500),
      createdAt:       TS(),
    });
  }

  await batch.commit();
  return count;
}

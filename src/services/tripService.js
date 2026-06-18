import { db } from '../config/firebase';
import firebase from 'firebase/compat/app';

export async function publishTrip({ conducteurId, conducteurNom, depart, arrivee, date, heure, places, prix }) {
  const ref = await db.collection('trajets').add({
    conducteurId,
    conducteurNom,
    depart: depart.trim(),
    departLower: depart.trim().toLowerCase(),
    arrivee: arrivee.trim(),
    arriveLower: arrivee.trim().toLowerCase(),
    date,
    heure,
    places: Number(places),
    placesDisponibles: Number(places),
    prix: Number(prix),
    statut: 'actif',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function searchTrips({ depart, arrivee }) {
  const snap = await db.collection('trajets')
    .where('departLower', '==', depart.trim().toLowerCase())
    .where('arriveLower', '==', arrivee.trim().toLowerCase())
    .where('statut', '==', 'actif')
    .where('placesDisponibles', '>', 0)
    .orderBy('placesDisponibles')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTrip(id) {
  const snap = await db.collection('trajets').doc(id).get();
  if (!snap.exists) throw new Error('Trajet introuvable');
  return { id: snap.id, ...snap.data() };
}

export async function getRecentTrips(limitCount = 10) {
  const snap = await db.collection('trajets')
    .where('statut', '==', 'actif')
    .where('placesDisponibles', '>', 0)
    .orderBy('placesDisponibles')
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMyTrips(conducteurId) {
  const snap = await db.collection('trajets')
    .where('conducteurId', '==', conducteurId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function decrementPlace(trajetId) {
  await db.collection('trajets').doc(trajetId).update({
    placesDisponibles: firebase.firestore.FieldValue.increment(-1),
  });
}

import { db } from '../config/firebase';
import firebase from 'firebase/compat/app';
import { decrementPlace } from './tripService';

export async function reserveTrip({ passagerId, passagerNom, trajetId, trajetInfo }) {
  const existing = await db.collection('reservations')
    .where('passagerId', '==', passagerId)
    .where('trajetId', '==', trajetId)
    .get();

  if (!existing.empty) throw new Error('Vous avez déjà réservé ce trajet');

  const ref = await db.collection('reservations').add({
    passagerId,
    passagerNom,
    trajetId,
    conducteurId: trajetInfo.conducteurId,
    depart: trajetInfo.depart,
    arrivee: trajetInfo.arrivee,
    date: trajetInfo.date,
    heure: trajetInfo.heure,
    prix: trajetInfo.prix,
    statut: 'confirmée',
    note: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await decrementPlace(trajetId);
  return ref.id;
}

export async function getMyReservations(passagerId) {
  const snap = await db.collection('reservations')
    .where('passagerId', '==', passagerId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getReceivedReservations(conducteurId) {
  const snap = await db.collection('reservations')
    .where('conducteurId', '==', conducteurId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function rateTrip(reservationId, note) {
  await db.collection('reservations').doc(reservationId).update({ note });
}

export async function updateDriverRating(conducteurId) {
  const snap = await db.collection('reservations')
    .where('conducteurId', '==', conducteurId)
    .get();

  const notes = snap.docs
    .map((d) => d.data().note)
    .filter((n) => n !== null && n !== undefined);

  if (notes.length === 0) return;
  const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;

  await db.collection('users').doc(conducteurId).update({
    noteMoyenne: Math.round(moyenne * 10) / 10,
    nombreNotations: notes.length,
  });
}

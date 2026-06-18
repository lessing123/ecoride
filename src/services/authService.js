import { auth, db } from '../config/firebase';
import firebase from 'firebase/compat/app';

export async function register({ nom, prenom, email, password }) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await db.collection('users').doc(cred.user.uid).set({
    nom,
    prenom,
    email,
    noteMoyenne: 0,
    nombreNotations: 0,
    kmTotal: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return cred.user;
}

export async function login(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  return cred.user;
}

export async function logout() {
  await auth.signOut();
}

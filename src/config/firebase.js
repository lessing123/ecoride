import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD4o0xHsnCFzm5ALRdMVxE4l46CPx1iQ1E',
  authDomain: 'ecoride-app-de645.firebaseapp.com',
  projectId: 'ecoride-app-de645',
  storageBucket: 'ecoride-app-de645.firebasestorage.app',
  messagingSenderId: '347165138245',
  appId: '1:347165138245:web:f399d8b8c956f74a34f22c',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;

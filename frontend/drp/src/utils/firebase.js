import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfLYdWcfYY8NhNnN0lu64IQFvFOjjSrZ4",
  authDomain: "drpnotifications.firebaseapp.com",
  projectId: "drpnotifications",
  storageBucket: "drpnotifications.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:494910770319:android:8517342c2a42561c32f4fa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

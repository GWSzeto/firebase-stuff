import { useState, useEffect } from 'react'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import _ from 'lodash'
import { v4 } from 'uuid'

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
})

export const useProvideFirebase = () => {
  const fieldValue = firebase.firestore.FieldValue
  const recaptcha = firebase.auth
  const storage = firebase.storage()
  const timestamp = firebase.firestore.Timestamp

  return {
    fieldValue,
    recaptcha,
    storage,
    timestamp,
  }
}

export const useProvideAuth = () => {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn'))
  const [user, setUser] = useState(null)
  const [pharmacist, setPharmacist] = useState(null)

  useEffect(() => {
    const unSubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const { pharm } = (await user.getIdTokenResult()).claims
        const { firstName, lastName, email, created } = (await firebase
          .firestore()
          .doc(`users/${user.uid}`)
          .get())
          .data()
        
        window.Intercom('boot', {
          app_id: process.env.INTERCOM_ID,
          user_id: user.uid,
          email,
          name: `${firstName} ${lastName}`,
          created_at: (created ? created : Date.now())
        })

        localStorage.setItem('loggedIn', 'true')

        setLoggedIn(true)
        setPharmacist(pharm)
        setUser(user)
      } else {
        window.Intercom('shutdown')
        localStorage.removeItem('loggedIn')
        setLoggedIn(null)
        setUser(false)
      }
    })

    return () => unSubscribe()
  }, [])

  const signIn = async (email, password) => {
    const signedIn = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
    setUser(signedIn.user)

    return signedIn.user
  }

  const signUp = async (email, password) => {
    const signedUp = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
    setUser(signedUp.user)

    return signedUp.user
  }
  
  const signOut = async () => {
    await firebase
      .auth()
      .signOut()
    setUser(false)   
  }

  const sendPasswordResetEmail = email => firebase
    .auth()
    .sendPasswordResetEmail(email)

  const signInWithPhoneNumber = (phoneNumber, recaptcha) => firebase
    .auth()
    .signInWithPhoneNumber(phoneNumber, recaptcha)

  const checkIfEmailDoesNotExist = async email =>
    _.isEmpty(await firebase.auth().fetchSignInMethodsForEmail(email))

  return {
    user,
    pharmacist,
    loggedIn,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    signInWithPhoneNumber,
    checkIfEmailDoesNotExist,
  }
}

export const useProvideFirestore = () => {
  const db = firebase.firestore()

  const user = id => firebase.firestore().doc(`users/${id}`)
  const payment = id => firebase.firestore().doc(`cards/${id}`)
  const order = id => firebase.firestore().doc(`orders/${id}`)
  const prescription = id => firebase.firestore().doc(`prescriptions/${id}`)
  const insurance = id => firebase.firestore().doc(`insurances/${id}`)
  const otc = id => firebase.firestore().doc(`OTC/${id}`)
  const consultationRoom = () => firebase.firestore().doc('consultationRoom/consultationRoom')

  const users = () => firebase.firestore().collection('users')
  const payments = () => firebase.firestore().collection('cards')
  const orders = () => firebase.firestore().collection('orders')
  const prescriptions = () => firebase.firestore().collection('prescriptions')
  const insurances = () => firebase.firestore().collection('insurances')
  const otcs = () => firebase.firestore().collection('OTC')

  return {
    db,
    user,
    payment,
    order,
    prescription,
    insurance,
    otc,
    users,
    payments,
    orders,
    prescriptions,
    insurances,
    otcs,
    consultationRoom,
  }
}



const addPayment = async (userId, cardInfo) => {
  const { cardNumber, ...card } = cardInfo
  const cardId = v4()
  const batch = firebase.firestore().batch()
}


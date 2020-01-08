import React, { createContext, useContext } from 'react'
import { useProvideFirebase, useProvideAuth, useProvideFirestore } from './firebase'

const firebaseContext = createContext()
const authContext = createContext()
const firestoreContext = createContext()

export const ProvideFirebase = ({ children }) => {
  const firebase = useProvideFirebase()
  return <firebaseContext.Provider value={firebase}>{children}</firebaseContext.Provider>
}

export const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>  
}

export const ProvideFirestore = ({ children }) => {
  const firestore = useProvideFirestore()
  return <firestoreContext.Provider value={firestore}>{children}</firestoreContext.Provider> 
}

export const useFirebase = () => useContext(firebaseContext)
export const useAuth = () => useContext(authContext)
export const useFirestore = () => useContext(firestoreContext)

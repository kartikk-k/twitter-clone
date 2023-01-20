import { createContext, useState, useEffect } from "react";
import { supabase } from "utils/supabase";
import Router from "next/router";

const AuthContext = createContext()
export default AuthContext

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)


    useEffect(() => {
        getUser()
    }, [])

    // login user with twitter
    const loginWithTwitter = async () => {
        let { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'twitter'
        })

        console.log("data: ", data)
        error ?? console.log("error", error)
    }

    // get data of logged in user
    const getUser = async () => {
        let { data, error } = await supabase.auth.getUser()

        // processing and storing response
        if (data) {
            data.user?.aud === 'authenticated' ? setIsAuthenticated(true) : setIsAuthenticated(false)
            setUserData(data)
            console.log(data)
        } else {
            console.log("User not logged in")
        }
    }

    const signOutUser = async () => {
        alert("signing out")
        console.log("signing out!!")
        let response = await supabase.auth.signOut()

        // processing if response not returns error
        if (!response.error) {
            setIsAuthenticated(false)
            setUserData('')
        }
    }

    const contextData = {
        isAuthenticated: isAuthenticated,
        loginWithTwitter: loginWithTwitter,
        userData: userData,
        signOutUser: signOutUser
    }
    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}
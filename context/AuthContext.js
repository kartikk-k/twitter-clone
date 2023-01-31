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

    useEffect(() => {
        if (!isAuthenticated || !userData) return

        checkUserProfile()
    }, [isAuthenticated, userData])

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

    // signout logged in user from web
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

    // check if user profile is present in database or not
    const checkUserProfile = async () => {
        let { data, error } = await supabase
            .from("user_profiles")
            .select("username")
            .eq("user_id", userData.user.id)
            .single()

        if (data) return  // returns if returns data as account is already present in database

        createUserProfile()
    }

    // creates user profile - runs for the first time user signups
    const createUserProfile = async () => {
        let user_account_info = userData.user.identities[0].identity_data

        let { data, error } = await supabase
            .from("user_profiles")
            .insert([{
                username: user_account_info.user_name,
                name: user_account_info.full_name,
                profile_img: user_account_info.avatar_url,
                user_id: userData.user.id
            }])

        error ? console.log("account not added!") : console.log("account added succesfully!")
    }

    // contextData
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
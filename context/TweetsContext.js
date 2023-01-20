import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "utils/supabase";
import Router from "next/router";
import AuthContext from "./AuthContext";

const TweetContext = createContext()
export default TweetContext

export const TweetProvider = ({ children }) => {
    const { userData } = useContext(AuthContext)
    const [tweets, setTweets] = useState()


    useEffect(() => {
        getTweets()
    }, [])


    // post new tweet
    const postTweet = async (tweet) => {
        let { data, error } = await supabase.from("Tweets").insert({
            tweet: tweet,
            user_id: userData.user?.id,
            username: userData.user?.identities[0].identity_data.user_name,
            name: userData.user?.identities[0].identity_data.full_name,
            likes_count: 0,
            comments_count: 0
        })

        // processing response
        console.log("tweet data", data)

    }

    const getTweets = async () => {
        let { data, error } = await supabase.from("Tweets").select("username, name, tweet, likes_count, comments_count")

        // processing data
        data ? setTweets(data) : console.log("error fetching tweets")
    }

    const contextData = {
        tweets: tweets,
        postTweet: postTweet,
        getTweets: getTweets
    }
    return (
        <TweetContext.Provider value={contextData}>
            {children}
        </TweetContext.Provider>
    )
}
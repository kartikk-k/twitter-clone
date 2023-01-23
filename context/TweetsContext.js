import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "utils/supabase";
import Router from "next/router";
import AuthContext from "./AuthContext";

const TweetContext = createContext()
export default TweetContext

export const TweetProvider = ({ children }) => {
    const { userData, isAuthenticated } = useContext(AuthContext)
    const [tweets, setTweets] = useState()
    const [likedTweets, setLikedTweets] = useState()


    useEffect(() => {
        getTweets()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            if (userData.user) {
                getLikedTweetsList()
            }
        }
    }, [userData])


    // post new tweet
    const postTweet = async (tweet) => {
        let { data, error } = await supabase.from("tweets").insert({
            tweet: tweet,
            user_id: userData.user?.id,
            username: userData.user?.identities[0].identity_data.user_name,
            name: userData.user?.identities[0].identity_data.full_name,
            likes_count: 0,
            comments_count: 0,
            profile_img: userData.user?.identities[0].identity_data.avatar_url
        })

        // processing response
        console.log("tweet data", data)

    }

    const getTweets = async () => {
        console.log("getting tweets from function")
        let { data, error } = await supabase.from("tweets").select("*").range(0, 9)

        // processing data
        console.log("Tweets data: ", data)
        data ? setTweets(data) : console.log("error fetching tweets", error)
    }

    const getLikedTweetsList = async () => {
        console.log("userdata?user: ", userData.user)
        let { data, error } = await supabase.from("liked_tweets").select("tweet_id").eq("user_id", userData.user?.id)

        // processing data
        // data ? setLikedTweets(data) : console.log("error fetching liked tweets: ", error)
        console.log("liked tweets", data)
        let likedList = ''

        // mapping through liked tweets list to get all the ids of tweet that were liked by the user
        data?.map((obj) => {
            likedList = likedList + `${obj.tweet_id},`
        })

        likedList = likedList.substring(0, likedList.length - 1)
        getLiked(likedList)
        console.log(likedList)
    }

    const getLiked = async (list) => {
        let { data, error } = await supabase
            .rpc("get_liked_tweets", { liked_input: list })


        console.log("liked tweets content: ", data)
        data ? setLikedTweets(data) : console.log("error processing liked tweets: ", error)
    }
    //     const { data, error } = await supabase
    //   .rpc('all_users', { created_from: ..., created_to: ... })



    const contextData = {
        tweets: tweets,
        postTweet: postTweet,
        getTweets: getTweets,
        likedTweets: likedTweets
    }
    return (
        <TweetContext.Provider value={contextData}>
            {children}
        </TweetContext.Provider>
    )
}
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "utils/supabase";
import Router from "next/router";
import AuthContext from "./AuthContext";

const TweetContext = createContext()
export default TweetContext

export const TweetProvider = ({ children }) => {
    const { userData, isAuthenticated } = useContext(AuthContext)
    const [tweets, setTweets] = useState()
    const [isLoading, setIsLoading] = useState()
    const [likedTweets, setLikedTweets] = useState()


    useEffect(() => {
        getTweets()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            if (userData.user && tweets) {
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
        error ? console.log("error posting tweet: ", error) : console.log("tweet data: ", data)
    }

    const getTweets = async () => {
        console.log("getting tweets from function")
        let { data, error } = await supabase.from("tweets").select("*").range(0, 9)

        // processing data
        console.log("Tweets data: ", data)
        if (data) {
            let newData = data.map(tweetData => {
                return { ...tweetData, isLiked: false }
            })
            setTweets(newData)
            // getLikedTweetsList()
        } else {
            console.log("error fetching tweets", error)
        }
    }

    const getLikedTweetsList = async () => {
        // console.log("userdata?user: ", userData.user)
        let { data, error } = await supabase.from("liked_tweets").select("tweet_id").match({ user_id: userData.user?.id, })

        // processing data
        console.log("liked tweets", data)
        let likedList = []

        // mapping through liked tweets list to get all the ids of tweet that were liked by the user
        data?.map((obj) => {
            likedList = likedList.concat(obj.tweet_id)
            console.log("liked list: ", likedList)
        })

        if (tweets) {
            let updatedTweets = tweets.map(tweet => {
                tweet.isLiked = likedList.some(tweet_id => tweet_id === tweet.id)
                console.log(tweet.isLiked)
                return tweet
            })

            setTweets(updatedTweets)

            console.log("updated tweets: ", updatedTweets)
        }
    }

    //     const { data, error } = await supabase
    //   .rpc('all_users', { created_from: ..., created_to: ... })



    const contextData = {
        tweets: tweets,
        postTweet: postTweet,
        getTweets: getTweets,
        likedTweets: likedTweets,
        isLoading: isLoading
    }
    return (
        <TweetContext.Provider value={contextData}>
            {children}
        </TweetContext.Provider>
    )
}
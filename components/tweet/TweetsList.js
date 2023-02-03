import React, { useEffect, useContext, useState } from 'react'
import { supabase } from 'utils/supabase'
import AuthContext from 'context/AuthContext'
import { LoadingIcon } from '../Icons'
import NewComment from '../comment/NewComment'
import SingleTweet from './SingleTweet'



function TweetsList({ requestFor, requestUser = null, requestTweetId = null }) {   // requestForm options: [ all, user, single, liked ]
    // checking auth and getting logged-in user data
    const { userData, isAuthenticated } = useContext(AuthContext)

    const [tweets, setTweets] = useState()
    const [isTweetsLoading, setIsTweetsLoading] = useState()
    const [isLikedTweetsReady, setIsLikedTweetsReady] = useState()

    const [date, setDate] = useState([])
    const [time, setTime] = useState([])


    useEffect(() => {
        setIsTweetsLoading(true)
        getTweets()
    }, [])

    // get liked tweets of logged in user
    useEffect(() => {
        if (!tweets || isTweetsLoading) return
        if (!isAuthenticated || !userData.user) return setIsLikedTweetsReady(true)

        getLikedTweetsList()
    }, [isTweetsLoading, userData])


    // get list of tweets
    const getTweets = async () => {
        // adding isLiked field in all tweets once tweets is ready
        const updateTweetData = (data) => {
            let newData = data.map(tweetData => {
                return { ...tweetData, isLiked: false }
            })

            // setting tweets state
            setTweets(newData)
            setIsTweetsLoading(false)
        }

        // getting tweets as per requestType
        if (requestFor === 'all') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .order('id', { ascending: false })
                .range(0, 9)

            data ? updateTweetData(data) : setIsTweetsLoading(false)

        } else if (requestFor === 'user') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .eq("username", requestUser)
                .order('id', { ascending: false })
                .range(0, 9)

            data ? updateTweetData(data) : setIsTweetsLoading(false)

        } else if (requestFor === 'single') {
            let { data, error } = await supabase
                .from("tweets")
                .select("*")
                .eq("id", requestTweetId)
                .range(0, 1)

            if (data) {
                updateTweetData(data)

                // this will be map once to set upload data 
                data.map(tweet => {
                    uploadData(tweet.created_at, tweet.id)
                })
            } else {
                setIsTweetsLoading(false)
            }

        }
    }

    // get list of liked tweets
    const getLikedTweetsList = async () => {
        // getting all the tweets to be checked for liked status
        let tweets_list = []

        tweets.map(tweet => {
            return tweets_list = tweets_list.concat(tweet.id)
        })

        tweets_list = tweets_list.toString()

        // finally setting status of tweet if liked
        const processLikedTweets = (data) => {
            let likedList = []

            // creating an array of liked tweet's id
            data.map(liked_tweet => {
                likedList = likedList.concat(liked_tweet.tweet_id)
            })

            let updatedTweets = tweets.map(tweet => {
                tweet.isLiked = likedList.some(tweet_id => tweet_id === tweet.id)
                return tweet
            })

            // updating state of tweets
            setTweets(updatedTweets)
        }

        let { data, error } = await supabase
            .from("liked_tweets")
            .select("tweet_id")
            .filter('tweet_id', 'in', `(${tweets_list})`)
            .eq("user_id", userData.user.id)

        if (data) processLikedTweets(data)

        setIsLikedTweetsReady(true)
    }

    // to get upload date and time for detailed tweet
    const uploadData = (created_at, tweetId) => {
        if (created_at) {
            // spliting date and time
            created_at = created_at.split("T")

            // setting date
            let date = created_at[0]
            date = date.split("-")
            // ...date to create a copy of object & [tweetid] to access the object with unique id
            setDate({ ...date, [tweetId]: `${date[2]}/${date[1]}/${date[0]}` })

            // setting time
            let time = created_at[1]
            time = time.split(".")
            let newTime = time[0].split(":")
            setTime({ ...time, [tweetId]: newTime[0] + ":" + newTime[1] })
        }
    }

    if (isLikedTweetsReady) {
        return (
            <div className={requestFor === 'single' ? 'py-2' : 'border-b mb-32 border-gray-300'}>

                {requestFor === 'all' && (
                    <h1 className='p-2 text-lg font-bold'>Tweets</h1>
                )}

                {/* {isLikedTweetsReady ? ( */}
                <div className='divide-y divide-gray-300'>
                    {tweets && tweets != 0 ? tweets.map((tweet, index) => {

                        return (
                            <div key={index} className="pb-2">
                                {requestFor != 'single' && (
                                    <SingleTweet requestFor={requestFor} tweet={tweet} />
                                )}
                                {requestFor === 'single' && (
                                    <div>
                                        <SingleTweet date={date[tweet.id]} time={time[tweet.id]} requestFor={requestFor} tweet={tweet} />
                                        {isAuthenticated && (
                                            <NewComment tweetId={tweet.id} commentCount={tweet.comments_count} />
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    }) : <p>No tweets to show</p>}
                </div>

                {/* ) : <div className='flex items-center justify-center h-full'>
                    <LoadingIcon className="w-8 h-8 animate-spin" />
                </div>} */}
            </div>
        )
    } else {
        return (
            <div className='flex justify-center mt-5'>
                <LoadingIcon className="w-8 h-8 animate-spin" />
            </div>
        )
    }
}

export default TweetsList
import AuthContext from 'context/AuthContext'
import React, { useContext } from 'react'
import { RefreshIcon } from './Icons'
import NewTweetBox from './tweet/NewTweetBox'
import TweetsList from './tweet/TweetsList'

function Feed() {
    const { isAuthenticated } = useContext(AuthContext)

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>

            {/* Navbar */}
            <div className='sticky top-0 z-40 flex justify-between px-4 py-4 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                <h1 className='text-lg font-bold'>Home</h1>
                <div onClick={() => getTweets()}>
                    <RefreshIcon />
                </div>
            </div>

            {/* Tweet box */}
            {isAuthenticated && (
                <NewTweetBox />
            )}

            {/* Tweets list */}
            <TweetsList requestFor="all" />
        </div>
    )
}

export default Feed
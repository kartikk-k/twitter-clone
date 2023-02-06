import AuthContext from 'context/AuthContext'
import React, { useContext, useEffect, useState } from 'react'
import { RefreshIcon } from './Icons'
import NewTweetBox from './tweet/NewTweetBox'
import TweetsList from './tweet/TweetsList'

function Feed() {
    const { isAuthenticated } = useContext(AuthContext)
    const [isRemount, setIsRemount] = useState()

    useEffect(() => {
        setIsRemount(false)
    }, [isRemount])

    return (
        <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>

            {/* Navbar */}
            <div className='sticky top-0 z-40 flex justify-between px-2 py-4 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                <h1 className='text-lg font-bold'>Home</h1>
                <div onClick={() => setIsRemount(true)}>
                    <RefreshIcon />
                </div>
            </div>

            {/* Tweet box */}
            {isAuthenticated && (
                <NewTweetBox />
            )}

            {/* Tweets list */}
            {!isRemount && (
                <TweetsList requestFor="all" />
            )}
        </div>
    )
}

export default Feed
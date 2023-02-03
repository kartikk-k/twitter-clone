import React, { useEffect } from 'react'
import { BackIcon } from './Icons'
import { useRouter } from 'next/router'
import TweetsList from './tweet/TweetsList'
import CommentsList from './comment/CommentsList'

function TweetDetailed({ id }) {
    let router = useRouter()

    // useEffect(() => {
    //     if (!router.isReady) return
    // }, [router.isReady])


    if (!router.isReady) {
        return (
            <p>Loading...</p>
        )
    } else {
        return (
            <div className='h-screen col-span-8 overflow-auto md:col-span-7 lg:col-span-5'>
                <div className='mb-14'>
                    {/* header */}
                    <div onClick={() => router.back()} className='sticky top-0 z-40 flex items-center p-4 space-x-2 bg-white border-b cursor-pointer border-b-gray-300 bg-opacity-30 backdrop-blur-md'>
                        <BackIcon />
                        <p>Back</p>
                    </div>

                    <TweetsList requestFor="single" requestTweetId={id} />

                    {/* comments list */}
                    <h1 className='p-2 text-lg font-bold'>Comments</h1>
                    <CommentsList id={id} />

                </div>
            </div>
        )
    }
}

export default TweetDetailed
import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import TweetDetailed from 'components/TweetDetailed'
import AuthContext from 'context/AuthContext'
import { useContext } from 'react'
import Sidebar from 'components/Sidebar'
import Widgets from 'components/Widgets'
import { TweetProvider } from 'context/TweetsContext'

function Tweet() {
    const { isAuthenticated, loginWithTwitter } = useContext(AuthContext)

    let router = useRouter()

    let { id } = router.query

    return (
        <>
            <div className='max-h-screen mx-auto overflow-hidden max-w-7xl'>
                <Head>
                    <title>Twitter</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className='grid grid-cols-9 divide-x divide-gray-200'>
                    {/* sidebar */}
                    <Sidebar />

                    <TweetDetailed id={id} />

                    <TweetProvider>


                        {/* Widgets */}
                        <Widgets />

                    </TweetProvider>

                    {/* login with twitter */}
                    {!isAuthenticated && (
                        <div className='absolute bottom-0 left-0 flex items-center justify-between w-full px-2 py-4 mt-2 bg-twitter bg-opacity-30 backdrop-blur-md'>
                            <p className='font-bold md:text-lg'>Don't miss what's happening</p>
                            <button onClick={loginWithTwitter} className='px-5 py-2 text-white rounded-full shadow-lg bg-twitter'>Login in with Twitter</button>
                        </div>
                    )}

                </main>

            </div>
        </>
    )
}

export default Tweet
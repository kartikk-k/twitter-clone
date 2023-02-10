import React from 'react'
import Head from 'next/head'

function login() {
    return (
        <>
            <Head>
                <title>Login - Twitter</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='inline-flex flex-col items-center justify-center w-full min-h-screen'>
                <div className='flex-row justify-center max-w-[400px] p-6 space-y-4 border border-gray-400 rounded-md'>
                    <h1 className='text-center'>Login to Twitter Clone by Kartik</h1>
                    <div className='flex justify-center'>
                        <button className='px-5 py-2 text-white rounded-md bg-twitter'>Login with Twitter</button>
                    </div>
                    <p className='text-xs text-center text-gray-500'>This app is only for project purposes.</p>
                </div>
            </div>
        </>
    )
}

export default login
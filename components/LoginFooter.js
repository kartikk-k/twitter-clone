import React from 'react'
import { useContext } from 'react'
import AuthContext from 'context/AuthContext'

function LoginFooter() {
    let { loginWithTwitter } = useContext(AuthContext)
    return (
        <div className='absolute bottom-0 left-0 flex items-center justify-between w-full px-2 py-4 mt-2 bg-twitter bg-opacity-30 backdrop-blur-md'>
            <p className='font-bold md:text-lg'>Don't miss what's happening</p>
            <button onClick={loginWithTwitter} className='px-5 py-2 text-white rounded-full shadow-lg bg-twitter'>Login in with Twitter</button>
        </div>
    )
}

export default LoginFooter
import React, { useState, useContext } from 'react'
import AuthContext from 'context/AuthContext'
import { CalenderIcon, LocationIcon, ImageIcon } from '../Icons'
import { supabase } from 'utils/supabase'


function NewTweetBox() {
    const { userData } = useContext(AuthContext)
    const [input, setInput] = useState('')

    const handleClick = () => {
        postTweet(input)
        setInput('')
    }

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

    return (
        <div className='flex p-2 space-x-2 border-b border-gray-300'>
            <img
                src={userData.user?.identities[0].identity_data.avatar_url}
                alt="profile picture"
                className='object-cover w-10 h-10 rounded-full'
            />
            <div className='flex-1 space-y-4'>
                {/* text area */}
                <textarea maxLength={255} value={input} onChange={(e) => setInput(e.target.value)} className='w-full h-20 text-lg bg-transparent border-b outline-none resize-none border-b-gray-300' type="text" placeholder="what's in your mind?" />

                {/* options */}
                <div>
                    <div className='flex-row items-center justify-between flex-1 sm:flex'>
                        <div className='flex space-x-2'>
                            <div className='transition-transform cursor-pointer hover:scale-125'>
                                <ImageIcon />
                            </div>
                            <div className='transition-transform cursor-pointer hover:scale-125'>
                                <CalenderIcon />
                            </div>
                            <div className='transition-transform cursor-pointer hover:scale-125'>
                                <LocationIcon />
                            </div>
                        </div>
                        <div className='flex items-center justify-between space-x-2'>
                            {/* word count */}
                            <p>words: {
                                input.length
                            }/255 </p>
                            <button disabled={!input || input.length > 255} onClick={handleClick} className='px-5 py-2 font-bold text-white rounded-full bg-twitter disabled:opacity-60'>Tweet</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewTweetBox
import React from 'react'
import { useContext, useState } from 'react'
import AuthContext from 'context/AuthContext'
import { ImageIcon, LocationIcon, CalenderIcon } from '../Icons'

function NewComment({ tweetId, commentCount }) {
    const { userData } = useContext(AuthContext)
    const [input, setInput] = useState('')


    // post new comment to particular tweet
    const postComment = async () => {

        // adding comment in database
        let response = await supabase.from("comments").insert({
            tweet_id: tweetId,
            username: userData.user?.identities[0].identity_data.user_name,
            name: userData.user?.identities[0].identity_data.name,
            profile_img: userData.user?.identities[0].identity_data.avatar_url,
            comment: input,
            likes_count: 0,
            retweet_count: 0
        })

        // updating comments count if comment was aaded succesfully
        if (!response.error) {
            // setting input to empty
            setInput('')

            let response = await supabase
                .from("tweets")
                .update([{
                    comments_count: commentCount + 1
                }]).eq("id", tweetId)
        } else {
            alert("Error uploading comment!")
        }

    }

    return (
        <div className='flex p-2 my-4 space-x-2 border border-gray-200 rounded-md shadow-md'>
            <img
                src={userData.user?.identities[0].identity_data.avatar_url}
                alt="profile picture"
                className='object-cover w-10 h-10 rounded-full'
            />
            <div className='flex-1 space-y-4'>
                {/* text area */}
                <textarea maxLength={255} value={input} onChange={(e) => setInput(e.target.value)} className='w-full text-lg bg-transparent border-b outline-none resize-none h-14 border-b-gray-300' type="text" placeholder="what's in your mind?" />

                {/* options */}
                <div>
                    <div className='flex-row items-center justify-between flex-1 sm:flex'>
                        {/* options */}
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

                        {/* words count and post button */}
                        <div className='flex items-center justify-between space-x-2'>
                            {/* word count */}
                            <p>words: {
                                input.length
                            }/255 </p>
                            <button disabled={!input} onClick={() => postComment(tweetData.comments_count, tweetData.id)} className='px-5 py-2 font-bold text-white rounded-full bg-twitter disabled:opacity-60'>Reply</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewComment
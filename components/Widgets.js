import React from 'react'
import { SearchIcon } from './Icons'
import { TwitterTimelineEmbed } from 'react-twitter-embed'

function Widgets({ userId }) {
    return (
        <div className='hidden col-span-2 px-4 mt-2 lg:block'>
            {/* Search box */}
            <div className='flex items-center p-2 space-x-2 bg-gray-200 rounded-full'>
                <SearchIcon className="w-5 h-5" />
                <input type="text" name="searchbar" id="searchbar" placeholder='search here...' className='bg-transparent outline-none' />
            </div>

            {/* timeline */}
            {userId ? (

                <div className='max-h-screen pb-8 mt-4 overflow-scroll'>
                    <p className='pb-2 font-bold text-center'>From Twitter.com</p>
                    <TwitterTimelineEmbed
                        sourceType='profile'
                        screenName={userId}
                    />
                </div>
            ) :
                <p className='py-2 text-center'>Login to see widgets</p>
            }

        </div>
    )
}

export default Widgets
import React from 'react'
import { SearchIcon } from './Icons'
import { TwitterTimelineEmbed } from 'react-twitter-embed'

function Widgets() {
    return (
        <div className='hidden col-span-2 px-4 mt-2 lg:block'>
            {/* Search box */}
            <div className='flex items-center p-2 space-x-2 bg-gray-200 rounded-full'>
                <SearchIcon className="w-5 h-5" />
                <input type="text" name="searchbar" id="searchbar" placeholder='search here...' className='bg-transparent outline-none' />
            </div>

            {/* timeline */}
            <div className='max-h-screen mt-4 overflow-scroll'>
                <TwitterTimelineEmbed
                    sourceType='profile'
                    screenName='kartik_builds'
                />
            </div>

        </div>
    )
}

export default Widgets
import { supabase } from "utils/supabase"

export const Retweet = async ({ userId, tweet }) => {

    // posting it as tweet from logged in user
    let { data, error } = await supabase
        .from("tweets")
        .insert([{
            tweet: tweet.tweet,
            user_id: userId,
            username: tweet.username,
            name: tweet.name,
            likes_count: tweet.likes_count,
            comments_count: tweet.comments_count,
            profile_img: tweet.profile_img
        }])


    // updating retweet count on original tweet
    if (!error) {
        let { data, error } = await supabase.from("tweets").update([{
            retweets_count: tweet.retweets_count + 1
        }])
    }
}
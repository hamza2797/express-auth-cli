const rp = require('request-promise');



const getUrl = function() {
    let base_url = process.env.BASE_URL + '/facebook/return'
    return `https://www.facebook.com/v4.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${base_url}`
}


const getProfile = function(code) {
    let base_url = process.env.BASE_URL + '/facebook/return'
    let url = `https://graph.facebook.com/v4.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${base_url}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`
    return rp(url, { json: true })
        .then(resp => {
            let url2 = "https://graph.facebook.com/me?fields=id,name,email%20&access_token=" + resp.access_token;
            return rp(url2, { json: true })
        })

}


module.exports.getFacebookUrl = getUrl;
module.exports.getFacebookProfile = getProfile;
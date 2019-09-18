const { google } = require('googleapis');

const getGoogleAccountFromCode = async function(code) {

    const auth = createConnection();
    // get the auth "tokens" from the request

    const data = await auth.getToken(code);
    const tokens = data.tokens;

    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({
        auth: auth,
        version: 'v2'
    });
    return oauth2.userinfo.get()
}

const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: `${process.env.BASE_URL}/google/return`
};

function createConnection() {
    return new google.auth.OAuth2(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirect
    );
}

const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
 */
function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
        // access_type: 'offline',
        // prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
        scope: defaultScope
    });
}

/**
 * Create the google url to be sent to the client.
 */
const urlGoogle = function() {
    const auth = createConnection(); // this is from previous step
    const url = getConnectionUrl(auth);
    return url;
}

module.exports.getUrl = urlGoogle;
module.exports.getProfile = getGoogleAccountFromCode;
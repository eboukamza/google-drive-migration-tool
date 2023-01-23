const { OAuth2Client } = require('google-auth-library')
const http = require('http')
const url = require('url')
const open = require('open')
const destroyer = require('server-destroy')

// Download your OAuth2 configuration from the Google
const keys = require('./credentials.json')

/**
 * Start by acquiring a pre-authenticated oAuth2 client.
 */
async function main() {
  const oAuth2Client = await getAuthenticatedClient()

  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  const tokenInfo = await oAuth2Client.getTokenInfo(oAuth2Client.credentials.access_token)
  console.log(oAuth2Client.credentials)
  console.log(tokenInfo)
}

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
function getAuthenticatedClient() {
  return new Promise((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client(keys.web.client_id, keys.web.client_secret, keys.web.redirect_uris[0])

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email']
    })

    // Open an http server to accept the oauth callback.
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/success') > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams
            const code = qs.get('code')
            console.log(`Code is ${code}`)
            res.end('Authentication successful! Please return to the console.')
            server.destroy()

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code)
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens)
            console.info('Tokens acquired.')
            resolve(oAuth2Client)
          }
        } catch (e) {
          reject(e)
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        open(authorizeUrl, { wait: false, app: {name  :'chromium' }}).then((cp) => cp.unref())
      })

    destroyer(server)
  })
}

main().catch(console.error)

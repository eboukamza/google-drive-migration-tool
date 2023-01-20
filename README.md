Prerequisites
---
Follow Develop on Google Workspace guide

https://developers.google.com/workspace/guides/get-started?hl=en_US

1. Create a Google Cloud project (link)
2. Enable Drive API (link)
3. Configure OAuth consent screen (link)
4. Create OAuth credentials (link)

// TODO configure .env file

Get token with Google API node client
--
based on https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US


Uses https://www.npmjs.com/package/@google-cloud/local-auth to retrieve the token.
https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US#authorize_credentials_for_a_desktop_application

As described in the guide
- Create Credentials of type OAuth client ID
- Save the downloaded JSON file as `credentials.json`, and move the file to your working directory.



References
---

Google Auth reference:
https://github.com/googleapis/google-auth-library-nodejs#oauth2
https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest

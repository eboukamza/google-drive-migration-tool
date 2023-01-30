Prerequisites
---
Follow Develop on Google Workspace guide

https://developers.google.com/workspace/guides/get-started?hl=en_US

1. Create a Google Cloud project (link)
2. Enable Drive API (link)
3. Configure OAuth consent screen (link)
4. Create OAuth credentials (link)

Get token with Google API node client
--
based on https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US


Inspired on https://www.npmjs.com/package/@google-cloud/local-auth to retrieve the token.
https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US#authorize_credentials_for_a_desktop_application

As described in the guide
- Create Credentials of type OAuth client ID
- Create an .env file from .env template (`cp .env_template .env`) and set up from Oauth Credentials.

References
---

Google Auth reference:
https://github.com/googleapis/google-auth-library-nodejs#oauth2
https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest


Instructions
---
Trash should be empty

Create 'migrationSource' folder in the target Drive to contain files to migrate
Move manually all files to be migrated to 'migrationSource'.
All files in migrationSource should be shared with 'target' user with Editor role
Setup env vars
Run the script.
First time the script opens a new window to request the permissions to read and write files in Drive.
Credentials are stored in a file named token.json. If you want to change the user you need to delete this file.

This script copies files shared by 'source' user to 'target' user
Copied files are located at 'migrationDest' folder at MyDrive

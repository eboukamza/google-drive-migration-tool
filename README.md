# Google Drive Migration Tool

Transfer the ownership between two different domains by coping folder hierarchy and files.

| Source                 | Dest                   |
| ---------------------- | ---------------------- |
| Google Workspace       | Google Account (gmail) |
| Google Account (gmail) | Google Workspace       |
| Google Workspace A     | Google Workspace B     |

## Prerequisites

Follow Develop on Google Workspace guide to set up OAuth client id credentials

https://developers.google.com/workspace/guides/get-started?hl=en_US

1. Create a Google Cloud project
2. Enable Drive API
3. Configure OAuth consent screen
4. Create OAuth credentials

5. Create an .env file from .env template (`cp .env_template .env`) and set up env vars.

## Instructions

Trash should be empty

1. Share (with role Editor) files and folders to be transferred with destination account.
2. Create 'migrationSource' folder in the destination Drive account.
3. Put inside all files and folders to be migrated
4. Run the script

First time the script opens the browser to request the permissions to read and write files in Drive.
Credentials are stored in a file named token.json. If you want to change the user you need to delete this file.

Copied files are located at 'migrationDest' folder in the root (MyDrive)

## Resources

Google Auth reference:
https://github.com/googleapis/google-auth-library-nodejs#oauth2
https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest

Inspired on https://www.npmjs.com/package/@google-cloud/local-auth to retrieve the auth token.
https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US#authorize_credentials_for_a_desktop_application

Google Drive

Based on https://developers.google.com/drive/api/quickstart/nodejs?hl=en_US
Api reference: https://developers.google.com/drive/api/v3/reference

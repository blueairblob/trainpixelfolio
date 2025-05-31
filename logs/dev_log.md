
# Get structure
tree -a -I "node_modules|.git|.expo|.vscode|assets|package-lock.json|expo|.gitignore"

# List all files
for file in $(find . -type f -not -path "./node_modules/*" -not -path "./package-lock.json" -not -path "./.git/*" -not -path "*.lock" -not -path "*.log" -not -path "*.png" -not -path "*.jpg" -not -path "*.jpeg" -not -path "*.gif"); do echo "===== $file ====="; cat "$file"; echo ""; done > code.log


# git 

## Developing to the GitHub project:
Update auth configs:
```
git config --global user.name "blueairblob"
git config --global user.email "blueairblob@gmail.com"
```

Get Personal Access Token (PAT):

1) Go to GitHub.com and log in.

2) Click your profile picture (top-right) > Settings > Developer settings > Personal access tokens > Tokens (classic).

3) Click Generate new token (classic).

4) Give it a name (e.g., "Git Access"), select scopes like repo, and generate the token.

5) Copy the token (it’ll look something like ghp_xxxxxxxxxxxxxxxx).

6) Update Your Git Remote URL:
Instead of re-entering your username and password, modify the remote URL to include the PAT:

bash```
git remote set-url origin https://<your-username>:<your-pat>@github.com/blueairblob/trainpixelfolio.git
```
Replace <your-username> with blueairblob and <your-pat> with the token you generated. For example:
bash

So: 
```
git remote set-url origin https://blueairblob:ghp_xxxxxxxxxxxxxxxx@github.com/blueairblob/trainpixelfolio.git
```


PAT updated !

## Add to project
git add .;git commit -m "12.3 - Tidy package.json"; git push origin main



## How to release a build:

### iOS

TestFlight is Apple's official platform for testing apps and is generally the easier approach:

1. Submit to TestFlight:

```bash
eas build --platform ios --profile production --auto-submit
```

This builds your app and automatically submits it to App Store Connect.


2. If you've already built the app without auto-submit, you can submit it separately:

```bash
eas submit -p ios --latest
```

3. Invite Testers:

 - Log in to [App Store Connect](https://appstoreconnect.apple.com/)
 - Navigate to your app → TestFlight
 - Add testers via email under "External Testing" or "Internal Testing" (for your team)
 - Testers will receive an email invitation with instructions to download TestFlight and your app

### Android

```bash
eas build --platform android --profile production
```


I've assumed that you have an iphone and so this is an invite to try the "PicaLoco" app. This is Apples system for testing Mobile Phone Apps before they are accepted on to the Apple store. However, having said that this App is no where near ready and so I would be grateful is you could follow the instructions and download the TestFlight app in order to get access to the "PicaLoco" app. I would be very grateful if you could have a tinker and try anything under "Guest Mode" in other words I'm not expecting you to login or register at this stage.

Kind regards,
Simon
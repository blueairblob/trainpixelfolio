
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




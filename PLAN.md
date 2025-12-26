# Deployment Plan for 121watts.com

## Overview
Get your resume site live at **121watts.com** using GitHub Pages + Namecheap DNS.

---

## [DONE] Step 1: Install Git
- [x] Install Git for Windows via winget
- Status: **COMPLETE**

---

## Step 2: Update Resume Content
- [ ] Replace placeholder content in index.html with your actual info:
  - Your name
  - Contact info  
  - Professional summary
  - Work experience (from LinkedIn)
  - Education
  - Skills

---

## Step 3: Push to GitHub

Refresh PATH to use git:
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

    cd ~\resume-site
    git init
    git add .
    git commit -m "Initial commit - resume site"

Option A - Using GitHub CLI:
    gh repo create 121watts.com --public --source=. --push

Option B - Manual:
    1. Go to github.com/new
    2. Create repo named "121watts.com"
    3. Run:
       git remote add origin https://github.com/YOUR_USERNAME/121watts.com.git
       git branch -M main
       git push -u origin main

---

## Step 4: Enable GitHub Pages
1. Go to your repo on GitHub
2. Click Settings -> Pages (left sidebar)
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click Save
6. Wait ~1 min for deployment

---

## Step 5: Configure Namecheap DNS
In your Namecheap dashboard for 121watts.com:

### For Apex Domain (121watts.com):
Add these A Records pointing to GitHub's IPs:

| Type | Host | Value           |
|------|------|-----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |

### For WWW Subdomain:

| Type  | Host | Value                    |
|-------|------|--------------------------|
| CNAME | www  | YOUR_USERNAME.github.io  |

---

## Step 6: Enable HTTPS (in GitHub)
1. Go to repo Settings -> Pages
2. Under "Custom domain", enter: 121watts.com
3. Check "Enforce HTTPS" (may take a few minutes to become available)

---

## Timeline
- DNS propagation: 10 mins - 48 hours (usually ~30 mins)
- GitHub Pages build: ~1-2 minutes
- HTTPS certificate: ~15-30 minutes after DNS resolves

---

## Done!
Your resume will be live at:
- https://121watts.com
- https://www.121watts.com
# Resume Website

A simple, clean HTML resume website hosted on GitHub Pages with a custom Namecheap domain.

## Setup Instructions

### 1. Initialize Git Repository

```powershell
cd ~/resume-site
git init
git add .
git commit -m "Initial commit: Resume website"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `resume-site` or `yourname.github.io`
3. **Do NOT** initialize with README, .gitignore, or license (we already have files)

### 3. Connect Local Repository to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

### 5. Configure Custom Domain (Namecheap)

1. In the same GitHub Pages settings, scroll to **Custom domain**
2. Enter your Namecheap domain: `121watts.com`
3. Check **Enforce HTTPS** (after DNS propagates)
4. This will create a `CNAME` file in your repository (or use the one already created)

### 6. Configure DNS at Namecheap

1. Log into your Namecheap account
2. Go to **Domain List** → Select your domain → **Manage**
3. Go to **Advanced DNS** tab
4. Add these records:

   **For apex domain (121watts.com):**
   - Type: `A Record`
   - Host: `@`
   - Value: `185.199.108.153`
   - TTL: Automatic
   
   - Type: `A Record`
   - Host: `@`
   - Value: `185.199.109.153`
   - TTL: Automatic
   
   - Type: `A Record`
   - Host: `@`
   - Value: `185.199.110.153`
   - TTL: Automatic
   
   - Type: `A Record`
   - Host: `@`
   - Value: `185.199.111.153`
   - TTL: Automatic

   **For www subdomain:**
   - Type: `CNAME Record`
   - Host: `www`
   - Value: `YOUR_USERNAME.github.io`
   - TTL: Automatic

### 7. Update and Push CNAME File

After GitHub creates the CNAME file, you may need to pull it:

```powershell
git pull origin main
```

Or create it manually if needed:

```powershell
# CNAME file already created with 121watts.com
git add CNAME
git commit -m "Add custom domain 121watts.com"
git push origin main
```

### 8. Wait for DNS Propagation

- DNS changes can take 24-48 hours to propagate
- You can check status at: https://www.whatsmydns.net/
- Once propagated, your site will be live at your custom domain!

## Updating Your Resume

1. Edit `index.html` with your information
2. Commit and push changes:

```powershell
git add index.html
git commit -m "Update resume"
git push origin main
```

Changes will be live on GitHub Pages within a few minutes.

## Notes

- GitHub Pages provides free hosting for static sites
- HTTPS is automatically enabled for custom domains
- The site will be available at both `121watts.com` and `yourname.github.io`


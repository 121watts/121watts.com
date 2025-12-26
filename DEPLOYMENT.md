# Deploying Your Resume to Namecheap

## Option 1: Using Namecheap Hosting (FTP/SFTP)

If you have Namecheap hosting:

1. **Get your FTP credentials:**
   - Log into your Namecheap account
   - Go to "Hosting List" → Select your domain
   - Find your FTP username and password (or reset it if needed)
   - Note your FTP server (usually `ftp.yourdomain.com` or similar)

2. **Upload using FileZilla or similar FTP client:**
   - Download FileZilla (free): https://filezilla-project.org/
   - Connect using your FTP credentials
   - Navigate to the `public_html` folder (or `www` or `htdocs` depending on your setup)
   - Upload `index.html` to that folder

3. **Verify:**
   - Visit your domain in a browser
   - Your resume should be visible!

## Option 2: Using Namecheap cPanel

1. Log into your Namecheap account
2. Access cPanel
3. Open "File Manager"
4. Navigate to `public_html` folder
5. Upload `index.html` using the upload button
6. Make sure it's named `index.html` (this is the default file browsers look for)

## Option 3: Using Command Line (if you have SSH access)

If you have SSH access to your hosting:

```bash
# Using SCP (Windows PowerShell or Git Bash)
scp index.html username@yourdomain.com:/public_html/

# Or using SFTP
sftp username@yourdomain.com
cd public_html
put index.html
exit
```

## Quick FTP Upload Script (PowerShell)

You can also use this PowerShell script if you have FTP access:

```powershell
$ftpServer = "ftp.yourdomain.com"
$ftpUser = "your-ftp-username"
$ftpPass = "your-ftp-password"
$localFile = "index.html"
$remotePath = "/public_html/index.html"

$ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer$remotePath")
$ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
$ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
$ftpRequest.UseBinary = $true

$fileContent = [System.IO.File]::ReadAllBytes($localFile)
$ftpRequest.ContentLength = $fileContent.Length

$requestStream = $ftpRequest.GetRequestStream()
$requestStream.Write($fileContent, 0, $fileContent.Length)
$requestStream.Close()

$response = $ftpRequest.GetResponse()
Write-Host "Upload complete: $($response.StatusDescription)"
$response.Close()
```

## Important Notes:

- Make sure your domain is properly configured to point to your hosting
- The file must be named `index.html` to be the default page
- If you don't have hosting yet, you can purchase it from Namecheap or use a free hosting service




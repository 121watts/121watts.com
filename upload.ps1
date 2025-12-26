# Namecheap FTP Upload Script
# Edit the variables below with your FTP credentials

$ftpServer = "ftp.yourdomain.com"  # Replace with your FTP server
$ftpUser = "your-ftp-username"     # Replace with your FTP username
$ftpPass = "your-ftp-password"     # Replace with your FTP password
$localFile = "index.html"
$remotePath = "/public_html/index.html"  # Adjust path if needed (could be /www/ or /htdocs/)

Write-Host "Uploading $localFile to $ftpServer..." -ForegroundColor Yellow

try {
    $ftpRequest = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer$remotePath")
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $ftpRequest.UseBinary = $true
    $ftpRequest.UsePassive = $true

    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $ftpRequest.ContentLength = $fileContent.Length

    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()

    $response = $ftpRequest.GetResponse()
    Write-Host "✓ Upload successful!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusDescription)" -ForegroundColor Green
    $response.Close()
} catch {
    Write-Host "✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your FTP credentials and server settings." -ForegroundColor Yellow
}




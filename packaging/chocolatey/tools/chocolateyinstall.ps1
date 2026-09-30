$ErrorActionPreference = 'Stop'
$version = '0.0.0'
$checksum64 = '0000000000000000000000000000000000000000000000000000000000000000'
$url64 = "https://github.com/GF-Elektro/Portal-App/releases/download/v$version/GFElektroPortal-$version-Setup.exe"
Install-ChocolateyPackage `
  -PackageName 'gfe-portal-eu' `
  -FileType 'exe' `
  -SilentArgs '/S' `
  -Url64bit $url64 `
  -Checksum64 $checksum64 `
  -ChecksumType64 'sha256'

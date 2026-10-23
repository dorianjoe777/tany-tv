param([string]$Src, [string]$Dst)

# Convierte HEIC -> PNG con el decodificador HEIF nativo de Windows (WinRT), sin instalar nada.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($op, $type) {
  $t = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
  $t.Wait(-1) | Out-Null
  $t.Result
}
function AwaitAction($op) {
  $m = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
  $t = $m.Invoke($null, @($op))
  $t.Wait(-1) | Out-Null
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.CreationCollisionOption, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.FileAccessMode, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Imaging.BitmapDecoder, Windows.Media.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Imaging.BitmapEncoder, Windows.Media.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapPixelFormat, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

$srcFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Src)) ([Windows.Storage.StorageFile])
$inStream = Await ($srcFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Media.Imaging.BitmapDecoder]::CreateAsync($inStream)) ([Windows.Media.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
$inStream.Dispose()

$outFolder = Await ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync((Split-Path -Parent $Dst))) ([Windows.Storage.StorageFolder])
$outFile = Await ($outFolder.CreateFileAsync((Split-Path -Leaf $Dst), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
$outStream = Await ($outFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])

$encoder = Await ([Windows.Media.Imaging.BitmapEncoder]::CreateAsync($outStream)) ([Windows.Media.Imaging.BitmapEncoder])
$encoder.SetSoftwareBitmap($bitmap)
AwaitAction ($encoder.FlushAsync())

$size = [int]$outStream.Size
$outStream.Seek(0)
$reader = New-Object Windows.Storage.Streams.DataReader($outStream.GetInputStreamAt(0))
Await ($reader.LoadAsync([uint32]$size)) ([uint32]) | Out-Null
$buffer = New-Object byte[] $size
$reader.ReadBytes($buffer)
$reader.Dispose()
$outStream.Dispose()

[System.IO.File]::WriteAllBytes($Dst, $buffer)
Write-Output "OK $Dst ($([math]::Round((Get-Item $Dst).Length/1024,1)) KB)"

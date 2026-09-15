const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const psScript = `
$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$shortcutPath = Join-Path $desktop "Subzero Prospector.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "C:\\Users\\Gabriel\\dev\\prospector\\SubzeroProspector.exe"
$shortcut.WorkingDirectory = "C:\\Users\\Gabriel\\dev\\prospector"
$shortcut.Description = "Subzero Prospector - Prospeccao e Vendas de Sites"
$shortcut.IconLocation = "C:\\Users\\Gabriel\\dev\\prospector\\app.ico,0"
$shortcut.Save()
Write-Host "ATALHO ATUALIZADO COM SUCESSO: $shortcutPath"
`;

const psPath = path.join(__dirname, 'update_shortcut.ps1');
fs.writeFileSync(psPath, psScript, 'utf-8');

try {
  const output = execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { encoding: 'utf-8' });
  console.log(output);
} catch (err) {
  console.error(err);
}

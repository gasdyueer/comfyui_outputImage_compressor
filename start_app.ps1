# ComfyUI 图片批量压缩工具 - 启动程序
Write-Host "==========================================" -ForegroundColor Green
Write-Host "ComfyUI 图片批量压缩工具 - 启动程序" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "正在检查Python环境..." -ForegroundColor Yellow
Write-Host ""

try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python环境正常" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✗ 未检测到Python环境" -ForegroundColor Red
        Write-Host "请先运行 setup_python.ps1 安装Python" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "按任意键退出..." -ForegroundColor Gray
        $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
} catch {
    Write-Host "✗ 未检测到Python环境" -ForegroundColor Red
    Write-Host "请先运行 setup_python.ps1 安装Python" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "正在启动应用程序..." -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "应用程序正在运行..." -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "请在浏览器中访问: http://localhost:5000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止应用程序" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

python main.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "应用程序已正常退出" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ 应用程序运行出错" -ForegroundColor Red
    Write-Host "请检查错误信息或查看README.md获取帮助" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
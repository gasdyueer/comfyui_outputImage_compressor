# ComfyUI 图片批量压缩工具 - 依赖安装
Write-Host "==========================================" -ForegroundColor Green
Write-Host "ComfyUI 图片批量压缩工具 - 依赖安装" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "正在检查依赖文件..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "requirements.txt") {
    Write-Host "✓ 找到依赖文件 requirements.txt" -ForegroundColor Green
    Write-Host ""
    Write-Host "正在安装依赖项，请稍候..." -ForegroundColor Yellow
    Write-Host ""
    
    # 升级pip
    Write-Host "正在升级pip..." -ForegroundColor Yellow
    python -m pip install --upgrade pip
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ pip升级成功" -ForegroundColor Green
    } else {
        Write-Host "! pip升级失败，将继续安装依赖" -ForegroundColor Yellow
    }
    
    Write-Host ""
    # 安装依赖
    python -m pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ 所有依赖安装成功！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ 依赖安装过程中出现错误" -ForegroundColor Red
        Write-Host "请检查网络连接或手动安装依赖" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 未找到依赖文件 requirements.txt" -ForegroundColor Red
    Write-Host "请确保在项目根目录下运行此脚本" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "依赖安装过程完成！" -ForegroundColor Green
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
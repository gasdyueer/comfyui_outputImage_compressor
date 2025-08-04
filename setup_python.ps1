# ComfyUI 图片批量压缩工具 - Python环境设置
Write-Host "==========================================" -ForegroundColor Green
Write-Host "ComfyUI 图片批量压缩工具 - Python环境设置" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "正在检查Python环境..." -ForegroundColor Yellow
Write-Host ""

try {
    # 检查Python版本
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Python已安装" -ForegroundColor Green
        Write-Host $pythonVersion -ForegroundColor Cyan
        Write-Host ""
        
        # 检查pip
        Write-Host "正在检查pip..." -ForegroundColor Yellow
        $pipVersion = python -m pip --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ pip已安装" -ForegroundColor Green
            Write-Host $pipVersion -ForegroundColor Cyan
        } else {
            Write-Host "✗ pip未安装，正在尝试安装..." -ForegroundColor Red
            python -m ensurepip --upgrade
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ pip安装成功" -ForegroundColor Green
            } else {
                Write-Host "✗ pip安装失败" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✗ 未检测到Python环境" -ForegroundColor Red
        Write-Host ""
        Write-Host "请访问 https://www.python.org/downloads/ 下载并安装Python 3.7或更高版本" -ForegroundColor Yellow
        Write-Host "安装时请确保勾选'Add Python to PATH'选项" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "安装完成后请重新运行此脚本" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 未检测到Python环境" -ForegroundColor Red
    Write-Host ""
    Write-Host "请访问 https://www.python.org/downloads/ 下载并安装Python 3.7或更高版本" -ForegroundColor Yellow
    Write-Host "安装时请确保勾选'Add Python to PATH'选项" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "安装完成后请重新运行此脚本" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Python环境检查完成！" -ForegroundColor Green
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
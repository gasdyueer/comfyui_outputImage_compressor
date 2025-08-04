@echo off
chcp 65001 >nul
echo ==========================================
echo ComfyUI 图片批量压缩工具 - Python环境设置
echo ==========================================
echo.

echo 正在检查Python环境...
echo.

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Python已安装
    python --version
    echo.
    echo 正在检查pip...
    python -m pip --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✓ pip已安装
        python -m pip --version
    ) else (
        echo ✗ pip未安装，正在尝试安装...
        python -m ensurepip --upgrade
        if %errorlevel% == 0 (
            echo ✓ pip安装成功
        ) else (
            echo ✗ pip安装失败
        )
    )
) else (
    echo ✗ 未检测到Python环境
    echo.
    echo 请访问 https://www.python.org/downloads/ 下载并安装Python 3.7或更高版本
    echo 安装时请确保勾选"Add Python to PATH"选项
    echo.
    echo 安装完成后请重新运行此脚本
    echo.
    pause
    exit /b
)

echo.
echo Python环境检查完成！
echo.
pause
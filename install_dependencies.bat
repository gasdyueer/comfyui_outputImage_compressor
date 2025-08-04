@echo off
chcp 65001 >nul
echo ==========================================
echo ComfyUI 图片批量压缩工具 - 依赖安装
echo ==========================================
echo.

echo 正在检查依赖文件...
echo.

if exist "requirements.txt" (
    echo ✓ 找到依赖文件 requirements.txt
    echo.
    echo 正在安装依赖项，请稍候...
    echo.
    
    python -m pip install --upgrade pip
    if %errorlevel% == 0 (
        echo ✓ pip升级成功
    ) else (
        echo ! pip升级失败，将继续安装依赖
    )
    
    echo.
    python -m pip install -r requirements.txt
    if %errorlevel% == 0 (
        echo.
        echo ✓ 所有依赖安装成功！
    ) else (
        echo.
        echo ✗ 依赖安装过程中出现错误
        echo 请检查网络连接或手动安装依赖
    )
) else (
    echo ✗ 未找到依赖文件 requirements.txt
    echo 请确保在项目根目录下运行此脚本
)

echo.
echo 依赖安装过程完成！
echo.
pause
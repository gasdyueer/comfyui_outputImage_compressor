@echo off
chcp 65001 >nul
echo ==========================================
echo ComfyUI 图片批量压缩工具 - 启动程序
echo ==========================================
echo.

echo 正在检查Python环境...
echo.

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Python环境正常
    echo.
) else (
    echo ✗ 未检测到Python环境
    echo 请先运行 setup_python.bat 安装Python
    echo.
    pause
    exit /b
)

echo 正在启动应用程序...
echo.

echo ==========================================
echo 应用程序正在运行...
echo.
echo 请在浏览器中访问: http://localhost:5000
echo.
echo 按 Ctrl+C 停止应用程序
echo ==========================================
echo.

python main.py

if %errorlevel% == 0 (
    echo.
    echo 应用程序已正常退出
) else (
    echo.
    echo ✗ 应用程序运行出错
    echo 请检查错误信息或查看README.md获取帮助
)

echo.
pause
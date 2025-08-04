# ComfyUI 图片批量压缩工具

[English Version](README_en.md) | [中文版](README.md)

> 本项目主要使用AI编写，经过作者审核后确认没有重大问题，因此选择发布在GitHub上。

这是一个基于 Flask 的 Web 应用程序，专为 ComfyUI 用户设计的图片批量压缩工具。它支持多种图片格式，提供高质量的压缩选项，并能保留图片的元数据和工作流信息。

## 功能特性

- **批量处理**：支持同时上传和压缩多个图片文件
- **拖拽上传**：支持拖拽文件夹或多个文件进行上传
- **多格式支持**：支持 PNG, JPG, JPEG, GIF, BMP, TIFF 等常见图片格式
- **可调节压缩**：可自定义 JPEG 质量、优化选项和渐进式 JPEG
- **实时预览**：显示压缩前后的文件大小对比和压缩率
- **元数据保留**：提取并保存图片的元数据和 ComfyUI 工作流信息
- **灵活下载**：支持单独下载或打包下载压缩后的文件
- **现代化界面**：采用现代化的暗色主题设计，支持响应式布局

## 快速开始

### 环境要求

- Python 3.7+
- Flask
- Pillow
- Werkzeug

### 安装步骤

对于Windows用户，我们提供了便捷的批处理脚本和PowerShell脚本，新手用户可以直接双击运行：

1. 克隆项目仓库：
   ```bash
   git clone <repository-url>
   cd comfyui_outputImage_compressor
   ```

2. 安装依赖：
   - 方法一（命令行）：
     ```bash
     pip install -r requirements.txt
     ```
   - 方法二（Windows新手友好）：
     双击运行 `install_dependencies.bat` 或 `install_dependencies.ps1`

3. 运行应用：
   - 方法一（命令行）：
     ```bash
     python main.py
     ```
   - 方法二（Windows新手友好）：
     双击运行 `start_app.bat` 或 `start_app.ps1`

4. 在浏览器中访问 `http://localhost:5000`

## 使用说明

1. **上传图片**：
   - 点击"选择文件"按钮选择图片
   - 或者将图片/文件夹拖拽到上传区域

2. **调整压缩设置**：
   - 使用滑块调整 JPEG 质量（数值越低，压缩率越高）
   - 选择是否启用优化文件大小
   - 选择是否启用渐进式 JPEG

3. **开始压缩**：
   - 点击"开始压缩"按钮处理所有上传的图片

4. **下载结果**：
   - 单独下载：点击每个压缩文件后的"下载"按钮
   - 批量下载：输入压缩包名称并点击"下载全部"按钮

## 项目结构

```
comfyui_outputImage_compressor/
├── main.py                 # 应用主入口
├── file_handler.py         # 文件处理模块
├── image_processor.py      # 图片处理模块
├── requirements.txt        # 项目依赖
├── setup_python.bat        # Windows Python环境检查脚本
├── setup_python.ps1        # Windows Python环境检查脚本 (PowerShell)
├── install_dependencies.bat # Windows 依赖安装脚本
├── install_dependencies.ps1 # Windows 依赖安装脚本 (PowerShell)
├── start_app.bat           # Windows 应用启动脚本
├── start_app.ps1           # Windows 应用启动脚本 (PowerShell)
├── templates/
│   └── index.html          # 主页面模板
├── static/
│   ├── style.css           # 样式文件
│   └── script.js           # 前端交互逻辑
├── uploads/                # 上传文件临时存储目录
└── temp_compressed/        # 压缩文件临时存储目录
```

## 技术栈

- **后端**：Python, Flask
- **图片处理**：Pillow
- **前端**：HTML5, CSS3, JavaScript
- **UI框架**：原生 JavaScript，无额外前端框架依赖
- **打包下载**：JSZip

## 配置说明

应用的主要配置在 `main.py` 文件中：

- `UPLOAD_FOLDER`：上传文件的临时存储路径
- `TEMP_COMPRESSED_FOLDER`：压缩文件的临时存储路径
- `ALLOWED_EXTENSIONS`：允许上传的文件扩展名
- `app.config['MAX_CONTENT_LENGTH']`：最大上传文件大小限制（默认64MB）

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

### 开发步骤

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

项目链接：[https://github.com/your-username/comfyui_outputImage_compressor](https://github.com/your-username/comfyui_outputImage_compressor)

## 鸣谢

- [Flask](https://flask.palletsprojects.com/)
- [Pillow](https://python-pillow.org/)
- [JSZip](https://stuk.github.io/jszip/)
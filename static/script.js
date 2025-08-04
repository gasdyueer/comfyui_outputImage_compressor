document.addEventListener('DOMContentLoaded', () => {
    // Core elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const selectedFilesList = document.getElementById('selected-files-list');
    const submitButton = document.getElementById('submitButton');
    const loadingSpinner = document.getElementById('loading-spinner');
    const flashMessagesDiv = document.getElementById('flash-messages');
    const clearFilesBtn = document.getElementById('clearFilesBtn');

    // Stats elements
    const totalFilesEl = document.getElementById('total-files');
    const totalSizeEl = document.getElementById('total-size');
    const compressionRatioEl = document.getElementById('compression-ratio');
    const progressTextEl = document.getElementById('progress-text');

    // Results elements
    const compressedResultsDisplay = document.getElementById('compressed-results-display');
    const compressedFilesList = document.getElementById('compressed-files-list');
    const downloadAllZipBtn = document.getElementById('downloadAllZipBtn');

    // State management
    let filesToUpload = [];
    let compressedFilesData = [];
    let droppedFolderName = '';
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function displayFlashMessage(message, category = 'info', duration = 5000) {
        const ul = document.createElement('ul');
        ul.classList.add('flashes');
        
        const li = document.createElement('li');
        li.classList.add(category, 'fade-in');
        
        const flashContent = document.createElement('div');
        flashContent.classList.add('flash-content');
        
        const icon = document.createElement('span');
        icon.classList.add('flash-icon');
        
        const text = document.createElement('span');
        text.classList.add('flash-text');
        text.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('flash-close');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => li.remove();
        
        flashContent.appendChild(icon);
        flashContent.appendChild(text);
        flashContent.appendChild(closeBtn);
        li.appendChild(flashContent);
        ul.appendChild(li);
        
        flashMessagesDiv.innerHTML = '';
        flashMessagesDiv.appendChild(ul);
        
        if (duration > 0) {
            setTimeout(() => {
                if (li.parentElement) {
                    li.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => li.remove(), 300);
                }
            }, duration);
        }
    }

    function removeFlashMessages() {
        flashMessagesDiv.innerHTML = '';
    }

    function isAllowedFile(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
    }

    function updateStats() {
        totalFilesEl.textContent = filesToUpload.length;
        
        totalOriginalSize = filesToUpload.reduce((total, file) => total + file.size, 0);
        totalSizeEl.textContent = formatFileSize(totalOriginalSize);
        
        // Show/hide clear button
        clearFilesBtn.style.display = filesToUpload.length > 0 ? 'inline-flex' : 'none';
        submitButton.disabled = filesToUpload.length === 0;
    }

    // File list display
    function updateFileListDisplay() {
        selectedFilesList.innerHTML = '';
        
        if (filesToUpload.length === 0) {
            selectedFilesList.innerHTML = `
                <li class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <p>暂无文件，请拖拽或选择图片</p>
                </li>
            `;
            updateStats();
            return;
        }

        filesToUpload.forEach((file, index) => {
            const li = document.createElement('li');
            li.classList.add('slide-up');
            li.style.animationDelay = `${index * 0.05}s`;
            
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            li.innerHTML = `
                <div class="file-item-info">
                    <svg class="file-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file" data-index="${index}" title="移除文件">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            
            selectedFilesList.appendChild(li);
        });

        // Add event listeners
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.currentTarget.dataset.index);
                const removedFile = filesToUpload[indexToRemove];
                filesToUpload.splice(indexToRemove, 1);
                
                displayFlashMessage(`已移除 ${removedFile.name}`, 'info', 2000);
                updateFileListDisplay();
                updateStats();
            });
        });

        updateStats();
    }

    function updateCompressedListDisplay() {
        compressedFilesList.innerHTML = '';
        
        if (compressedFilesData.length === 0) {
            compressedResultsDisplay.style.display = 'none';
            downloadAllZipBtn.style.display = 'none';
            return;
        }

        totalCompressedSize = 0;
        
        compressedFilesData.forEach((file, index) => {
            const li = document.createElement('li');
            li.classList.add('slide-up');
            
            if (file.status === 'success') {
                totalCompressedSize += file.compressed_size || 0;
                
                const originalSize = filesToUpload.find(f => f.name === file.original_filename)?.size || 0;
                const reduction = originalSize > 0 ? ((originalSize - (file.compressed_size || 0)) / originalSize * 100).toFixed(1) : 0;
                
                const workflowFilename = `${file.original_filename.split('.').slice(0, -1).join('.')}_workflow.json`;
                
                // Store base64 data in the button for later use
                const base64Data = file.data_base64 || '';
                
                li.innerHTML = `
                    <div class="file-item-info">
                        <div class="file-details">
                            <div class="file-name">${file.original_filename}</div>
                            <div class="file-size">
                                <span>${formatFileSize(originalSize)} → ${formatFileSize(file.compressed_size || 0)}</span>
                                <span style="color: var(--success-color); margin-left: 0.5rem;">-${reduction}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="file-actions">
                        <input type="checkbox" id="workflow-checkbox-${index}" class="workflow-checkbox">
                        <label for="workflow-checkbox-${index}" class="checkbox-label">包含工作流</label>
                        <button class="single-download-button"
                                data-filename="${file.compressed_filename}"
                                data-base64="${base64Data}"
                                data-workflow-filename="${workflowFilename}"
                                data-workflow-checkbox-id="workflow-checkbox-${index}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            下载
                        </button>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="file-item-info">
                        <div class="file-details">
                            <div class="file-name">${file.original_filename}</div>
                            <div class="file-size" style="color: var(--secondary-color);">
                                处理失败: ${file.message}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            compressedFilesList.appendChild(li);
        });

        // Update compression ratio
        const ratio = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1) : 0;
        compressionRatioEl.textContent = `${ratio}%`;

        // Add event listeners
        document.querySelectorAll('.single-download-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const filename = btn.dataset.filename;
                const base64 = btn.dataset.base64;
                const workflowCheckbox = document.getElementById(btn.dataset.workflowCheckboxId);
                
                // Download image using base64 data
                if (base64) {
                    // Create blob from base64 data
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'image/jpeg' });
                    
                    // Create download link
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    // Fallback to server download if base64 is not available
                    downloadFile(filename);
                }
                
                // Download workflow if checked
                if (workflowCheckbox && workflowCheckbox.checked) {
                    const workflowFilename = btn.dataset.workflowFilename;
                    const fileData = compressedFilesData.find(f => f.compressed_filename === filename);
                    if (fileData && fileData.workflow) {
                        downloadJsonFile(fileData.workflow, workflowFilename);
                    }
                }
            });
        });

        compressedResultsDisplay.style.display = 'block';
        compressedResultsDisplay.classList.add('slide-up');
        downloadAllZipBtn.style.display = 'inline-flex';
    }

    // Download utilities
    function downloadJsonFile(jsonData, filename) {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    function downloadFile(filename) {
        const link = document.createElement('a');
        link.href = `/download_compressed/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // File management
    function addFiles(newFiles) {
        removeFlashMessages();
        
        const validFiles = [];
        const skippedFiles = [];
        
        Array.from(newFiles).forEach(file => {
            if (!isAllowedFile(file.name)) {
                skippedFiles.push(`${file.name} (不支持的格式)`);
                return;
            }
            
            if (file.size > MAX_FILE_SIZE) {
                skippedFiles.push(`${file.name} (文件过大)`);
                return;
            }
            
            const exists = filesToUpload.some(existingFile => 
                existingFile.name === file.name && existingFile.size === file.size
            );
            
            if (exists) {
                skippedFiles.push(`${file.name} (已存在)`);
                return;
            }
            
            validFiles.push(file);
        });
        
        filesToUpload.push(...validFiles);
        updateFileListDisplay();
        
        // Show notifications
        if (validFiles.length > 0) {
            displayFlashMessage(`已添加 ${validFiles.length} 个文件`, 'success', 3000);
        }
        
        if (skippedFiles.length > 0) {
            displayFlashMessage(`跳过 ${skippedFiles.length} 个文件`, 'info', 4000);
        }
    }

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('highlight');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('highlight');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('highlight');
        
        dropZone.classList.add('pulse');
        setTimeout(() => dropZone.classList.remove('pulse'), 600);

        const items = e.dataTransfer.items;
        if (!items) return;

        if (items.length === 1) {
            const entry = items[0].webkitGetAsEntry();
            if (entry && entry.isDirectory) {
                droppedFolderName = entry.name;
            }
        }

        const files = [];
        const promises = [];

        for (const item of items) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                promises.push(traverseFileTree(entry));
            }
        }

        const nestedFiles = await Promise.all(promises);
        addFiles(nestedFiles.flat());
    });

    async function readAllDirectoryEntries(directoryReader) {
        let allEntries = [];
        let entries;
        do {
            entries = await new Promise((resolve, reject) => {
                directoryReader.readEntries(resolve, reject);
            });
            allEntries = allEntries.concat(entries);
        } while (entries.length > 0);
        return allEntries;
    }

    async function traverseFileTree(entry) {
        const files = [];
        if (entry.isFile) {
            try {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                files.push(file);
            } catch (err) {
                console.error('读取文件失败:', err);
            }
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            try {
                const entries = await readAllDirectoryEntries(dirReader);
                const filePromises = entries
                    .filter(subEntry => subEntry.isFile)
                    .map(subEntry => new Promise((resolve, reject) => 
                        subEntry.file(resolve, reject)
                    ).catch(err => {
                        console.error('读取子文件失败:', err);
                        return null;
                    }));
                
                const resolvedFiles = await Promise.all(filePromises);
                files.push(...resolvedFiles.filter(file => file !== null));
            } catch (err) {
                console.error('读取目录条目失败:', err);
            }
        }
        return files;
    }

    // File input
    fileInput.addEventListener('change', (e) => {
        addFiles(e.target.files);
        e.target.value = '';
    });

    // Clear files
    clearFilesBtn.addEventListener('click', () => {
        const fileCount = filesToUpload.length;
        filesToUpload = [];
        compressedFilesData = [];
        droppedFolderName = '';
        totalOriginalSize = 0;
        totalCompressedSize = 0;
        
        updateFileListDisplay();
        updateCompressedListDisplay();
        removeFlashMessages();
        
        displayFlashMessage(`已清空 ${fileCount} 个文件`, 'info', 2000);
    });

    // Download all as ZIP
    downloadAllZipBtn.addEventListener('click', async () => {
        if (compressedFilesData.length === 0) {
            displayFlashMessage('没有可供下载的压缩文件', 'info');
            return;
        }

        const zipNameInput = document.getElementById('zipNameInput');
        let zipName = zipNameInput.value.trim();
        
        if (!zipName) {
            if (droppedFolderName) {
                zipName = `${droppedFolderName}_compressed`;
            } else {
                const timestamp = new Date().toISOString()
                    .replace(/[:.-]/g, '')
                    .replace('T', '_')
                    .slice(0, 15);
                zipName = `compressed_${timestamp}`;
            }
        }
        
        zipName += '.zip';

        const zip = new JSZip();
        let processedCount = 0;

        displayFlashMessage('正在生成ZIP文件...', 'info');

        compressedFilesData.forEach(file => {
            if (file.status === 'success') {
                // For ZIP download, we still need to use base64 data
                // In a more advanced implementation, we could fetch the files from the server
                // But for now, we'll keep the base64 approach for ZIP downloads
                if (file.data_base64) {
                    zip.file(file.compressed_filename, file.data_base64, { base64: true });
                }
                
                // Add workflow JSON
                if (file.workflow) {
                    const workflowFilename = `${file.original_filename.split('.').slice(0, -1).join('.')}_workflow.json`;
                    zip.file(workflowFilename, JSON.stringify(file.workflow, null, 2));
                }
                
                processedCount++;
            }
        });

        try {
            const content = await zip.generateAsync({ 
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });
            
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = zipName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            displayFlashMessage(`ZIP文件已生成 (${processedCount} 个文件)`, 'success');
        } catch (error) {
            console.error('生成ZIP文件失败:', error);
            displayFlashMessage('生成ZIP文件失败，请重试', 'error');
        }
    });

    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        removeFlashMessages();
        compressedFilesData = [];
        totalCompressedSize = 0;
        
        if (filesToUpload.length === 0) {
            displayFlashMessage('请选择或拖拽图片文件', 'error');
            return;
        }

        submitButton.disabled = true;
        loadingSpinner.style.display = 'flex';
        compressedResultsDisplay.style.display = 'none';
        
        const BATCH_SIZE = 5;
        const filesQueue = [...filesToUpload];
        let processedCount = 0;

        async function processQueue() {
            if (filesQueue.length === 0) {
                submitButton.disabled = false;
                loadingSpinner.style.display = 'none';
                
                const successCount = compressedFilesData.filter(f => f.status === 'success').length;
                const errorCount = compressedFilesData.filter(f => f.status !== 'success').length;
                
                if (successCount > 0) {
                    displayFlashMessage(`压缩完成！成功 ${successCount} 个，失败 ${errorCount} 个`, 'success');
                } else {
                    displayFlashMessage('没有图片被成功处理', 'error');
                }
                
                filesToUpload = [];
                updateFileListDisplay();
                return;
            }

            const batch = filesQueue.splice(0, BATCH_SIZE);
            const formData = new FormData();
            
            batch.forEach(file => {
                formData.append('files[]', file);
            });

            formData.append('quality', document.getElementById('quality').value);
            formData.append('optimize', document.getElementById('optimize').checked);
            formData.append('progressive', document.getElementById('progressive').checked);

            processedCount += batch.length;
            progressTextEl.textContent = `处理中... ${processedCount}/${filesToUpload.length}`;

            try {
                const response = await fetch('/compress', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    compressedFilesData.push(...result.results);
                    updateCompressedListDisplay();
                    await processQueue();
                } else {
                    const errorData = await response.json();
                    const errorMsg = errorData.error || `处理失败 (HTTP ${response.status})`;
                    displayFlashMessage(errorMsg, 'error');
                    submitButton.disabled = false;
                    loadingSpinner.style.display = 'none';
                }
            } catch (error) {
                console.error('上传或压缩失败:', error);
                displayFlashMessage('网络错误或服务器无响应', 'error');
                submitButton.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        }

        progressTextEl.textContent = '准备中...';
        await processQueue();
    });

    // Quality slider
    window.updateQualityValue = function(value) {
        document.getElementById('qualityValue').textContent = value;
    };

    // Initialize
    updateFileListDisplay();
    
    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
});

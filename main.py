import os
import base64
import datetime
from flask import Flask, request, render_template, jsonify, make_response, send_file
from file_handler import FileHandler
from image_processor import ImageProcessor

# ====================================================================
# App Configuration
# ====================================================================
app = Flask(__name__)
app.secret_key = 'supersecretkey_for_flask_flash'

# Define paths
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(APP_ROOT) # Assuming project root is one level above main.py
UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'uploads')
TEMP_COMPRESSED_FOLDER = os.path.join(PROJECT_ROOT, 'temp_compressed')

# File settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024

# ====================================================================
# Service Initialization
# ====================================================================
file_handler = FileHandler(UPLOAD_FOLDER, ALLOWED_EXTENSIONS, TEMP_COMPRESSED_FOLDER)
image_processor = ImageProcessor()

# ====================================================================
# Flask Routes
# ====================================================================

@app.route('/')
def index():
    """Renders the main page."""
    response = make_response(render_template('index.html'))
    # Prevent caching of the main page
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/compress', methods=['POST'])
def compress():
    """Handles the image compression logic."""
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files selected!'}), 400

    files = request.files.getlist('files[]')
    
    try:
        quality = int(request.form.get('quality', 80))
        optimize = 'optimize' in request.form
        progressive = 'progressive' in request.form
    except ValueError:
        return jsonify({'error': 'Invalid compression parameters!'}), 400

    results = []
    
    for file in files:
        temp_input_path = None
        original_filename = None
        try:
            save_result = file_handler.save_file(file)
            if not save_result:
                continue

            temp_input_path, original_filename = save_result

            # 1. Extract metadata
            metadata = image_processor.extract_metadata(temp_input_path, original_filename)

            # 2. Compress image
            compressed_io = image_processor.compress_image(temp_input_path, quality, optimize, progressive)
            
            if compressed_io:
                base_name = os.path.splitext(original_filename)[0]
                compressed_filename = f"{base_name}_compressed.jpeg"
                
                # Save compressed file to temporary folder
                compressed_file_path = file_handler.save_compressed_file(compressed_io, compressed_filename)
                if not compressed_file_path:
                    results.append({'original_filename': original_filename, 'status': 'error', 'message': 'Failed to save compressed file'})
                    continue

                # 3. Extract workflow data
                workflow_data = image_processor.extract_workflow(temp_input_path)
                
                # Encode to base64 for ZIP download compatibility
                encoded_string = base64.b64encode(compressed_io.getvalue()).decode('utf-8')
                
                results.append({
                    'original_filename': original_filename,
                    'compressed_filename': compressed_filename,
                    'compressed_file_path': compressed_file_path,
                    'data_base64': encoded_string,
                    'compressed_size': len(compressed_io.getvalue()),
                    'workflow': workflow_data,
                    'metadata': metadata,
                    'status': 'success'
                })
            else:
                results.append({'original_filename': original_filename, 'status': 'error', 'message': 'Compression failed'})

        except Exception as e:
            if original_filename:
                results.append({'original_filename': original_filename, 'status': 'error', 'message': f'Processing failed: {e}'})
        finally:
            if temp_input_path:
                file_handler.cleanup_file(temp_input_path)
    
    response = jsonify({'results': results})
    # Prevent caching of compression results
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/download_compressed/<filename>')
def download_compressed(filename):
    """Download compressed file from temporary folder."""
    try:
        file_path = os.path.join(TEMP_COMPRESSED_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Download failed: {e}'}), 500

import threading
import time
import glob

def cleanup_temp_files():
    """定期清理临时文件夹中的文件"""
    while True:
        try:
            # 每小时清理一次
            time.sleep(3600)
            
            # 查找1小时前的文件并删除
            pattern = os.path.join(TEMP_COMPRESSED_FOLDER, '*')
            files = glob.glob(pattern)
            current_time = time.time()
            
            for file_path in files:
                if os.path.isfile(file_path):
                    file_modified = os.path.getmtime(file_path)
                    # 如果文件超过1小时未修改，则删除
                    if current_time - file_modified > 3600:
                        os.remove(file_path)
        except Exception as e:
            print(f"清理临时文件时出错: {e}")

# 启动后台清理线程
cleanup_thread = threading.Thread(target=cleanup_temp_files, daemon=True)
cleanup_thread.start()

# ====================================================================
# Main Execution
# ====================================================================

if __name__ == '__main__':
    app.run(debug=True)

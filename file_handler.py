import os
from werkzeug.utils import secure_filename

class FileHandler:
    def __init__(self, upload_folder, allowed_extensions, temp_compressed_folder=None):
        self.upload_folder = upload_folder
        self.allowed_extensions = allowed_extensions
        self.temp_compressed_folder = temp_compressed_folder
        os.makedirs(self.upload_folder, exist_ok=True)
        if self.temp_compressed_folder:
            os.makedirs(self.temp_compressed_folder, exist_ok=True)

    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def save_file(self, file):
        if not file or not file.filename or not self.allowed_file(file.filename):
            return None
        
        original_filename = secure_filename(file.filename)
        temp_input_path = os.path.join(self.upload_folder, original_filename)
        file.save(temp_input_path)
        return temp_input_path, original_filename

    def cleanup_file(self, file_path):
        if os.path.exists(file_path):
            os.remove(file_path)

    def save_compressed_file(self, compressed_io, filename):
        """Save compressed image to temporary folder and return the file path."""
        if not self.temp_compressed_folder:
            return None
            
        file_path = os.path.join(self.temp_compressed_folder, filename)
        with open(file_path, 'wb') as f:
            f.write(compressed_io.getvalue())
        return file_path
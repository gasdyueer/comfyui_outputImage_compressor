import os
import io
import json
import base64
import datetime
from typing import Any, Dict, Optional
from PIL import Image, ExifTags

class ImageProcessor:
    def _format_value(self, value: Any) -> Any:
        """Recursively formats a value to be JSON serializable."""
        if isinstance(value, bytes):
            try:
                return value.decode('utf-8', errors='ignore')
            except UnicodeDecodeError:
                return base64.b64encode(value).decode('utf-8')
        if isinstance(value, (tuple, list)):
            return [self._format_value(item) for item in value]
        if isinstance(value, dict):
            return {str(k): self._format_value(v) for k, v in value.items()}
        if hasattr(value, 'name'):  # Handle enum members from ExifTags.TAGS
            return value.name
        if not isinstance(value, (int, float, str, bool, type(None))):
            return str(value)
        return value

    def extract_metadata(self, image_path: str, original_filename: str) -> Dict[str, Any]:
        """Extracts metadata from an image and returns it as a dictionary."""
        metadata: Dict[str, Any] = {'original_filename': original_filename}
        try:
            with Image.open(image_path) as img:
                metadata['format'] = img.format or 'N/A'
                metadata['size'] = img.size
                metadata['mode'] = img.mode
                metadata['creation_time'] = datetime.datetime.fromtimestamp(os.path.getctime(image_path)).isoformat()
                metadata['modification_time'] = datetime.datetime.fromtimestamp(os.path.getmtime(image_path)).isoformat()
                
                info_dict = {k: v for k, v in img.info.items() if k not in ('exif', 'icc_profile')}
                metadata['info'] = self._format_value(info_dict)

                exif_raw = img.getexif()
                if exif_raw:
                    readable_exif = {ExifTags.TAGS.get(k, k): v for k, v in exif_raw.items()}
                    metadata['exif_readable'] = self._format_value(readable_exif)
                else:
                    metadata['exif_readable'] = None
            
            return metadata

        except Exception as e:
            print(f"Error extracting metadata: {e}")
            return {'error': str(e)}

    def compress_image(self, image_path: str, quality: int, optimize: bool, progressive: bool) -> Optional[io.BytesIO]:
        """Compresses an image to JPEG format without any metadata."""
        try:
            with Image.open(image_path) as img:
                img_data = list(img.getdata())
                stripped_img = Image.new(img.mode, img.size)
                stripped_img.putdata(img_data)

                if stripped_img.mode in ('RGBA', 'LA', 'P'):
                    stripped_img = stripped_img.convert('RGB')

                jpeg_byte_arr = io.BytesIO()
                stripped_img.save(
                    jpeg_byte_arr,
                    format='JPEG',
                    quality=quality,
                    optimize=optimize,
                    progressive=progressive
                )
                jpeg_byte_arr.seek(0)
                return jpeg_byte_arr
        except Exception as e:
            print(f"Error compressing image: {e}")
            return None

    def extract_workflow(self, image_path: str) -> Optional[Dict[str, Any]]:
        """Extracts and parses workflow data from image metadata."""
        try:
            with Image.open(image_path) as img:
                if 'workflow' in img.info:
                    workflow_json = img.info['workflow']
                    if isinstance(workflow_json, str):
                        try:
                            return json.loads(workflow_json)
                        except json.JSONDecodeError:
                            print(f"Warning: 'workflow' metadata in {os.path.basename(image_path)} is not a valid JSON string.")
                            return None
                    else:
                        return workflow_json  # Assume it's already a dict-like structure
            return None
        except Exception as e:
            print(f"Error extracting workflow: {e}")
            return None
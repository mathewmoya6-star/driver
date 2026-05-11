import os
import requests
from supabase import create_client, Client
from PIL import Image
import io

# Supabase configuration
SUPABASE_URL = "https://fktjmkmzlixlapeyhhyl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdGpta216bGl4bGFwZXloaHlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE0OTM3MSwiZXhwIjoyMDkyNzI1MzcxfQ.2I7MqP0GqHqBvhMvLhQoEYm0K5C_9tQGtA6mTd0kP3g"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_image(file_path, bucket="images"):
    """Upload an image to Supabase Storage"""
    with open(file_path, 'rb') as f:
        file_name = os.path.basename(file_path)
        # Compress image before upload
        img = Image.open(f)
        
        # Compress to WebP format (smaller file size)
        compressed = io.BytesIO()
        img.save(compressed, format='WEBP', quality=85, optimize=True)
        compressed.seek(0)
        
        # Upload to Supabase
        response = supabase.storage.from_(bucket).upload(
            f"images/{file_name.replace('.jpg', '.webp').replace('.png', '.webp')}",
            compressed.getvalue(),
            {"content-type": "image/webp"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(
            f"images/{file_name.replace('.jpg', '.webp').replace('.png', '.webp')}"
        )
        print(f"✓ Uploaded: {public_url}")
        return public_url

def upload_video(file_path, bucket="videos"):
    """Upload a video to Supabase Storage"""
    with open(file_path, 'rb') as f:
        file_name = os.path.basename(file_path)
        
        # Upload to Supabase
        response = supabase.storage.from_(bucket).upload(
            f"videos/{file_name}",
            f,
            {"content-type": "video/mp4"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(
            f"videos/{file_name}"
        )
        print(f"✓ Uploaded: {public_url}")
        return public_url

def update_material_with_media(material_id, image_url=None, video_url=None):
    """Update existing material with media URLs"""
    update_data = {}
    if image_url:
        update_data['image_url'] = image_url
        update_data['thumbnail_url'] = image_url.replace('images/', 'thumbnails/')
    if video_url:
        update_data['video_url'] = video_url
    
    response = supabase.table('materials').update(update_data).eq('id', material_id).execute()
    print(f"✓ Updated material {material_id}")

# Example: Batch upload all files in a folder
def batch_upload(folder_path, media_type="image"):
    """Upload all files in a folder"""
    uploaded_urls = []
    for filename in os.listdir(folder_path):
        if media_type == "image" and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            url = upload_image(os.path.join(folder_path, filename))
            uploaded_urls.append((filename, url))
        elif media_type == "video" and filename.lower().endswith(('.mp4', '.mov', '.avi')):
            url = upload_video(os.path.join(folder_path, filename))
            uploaded_urls.append((filename, url))
    
    return uploaded_urls

# Example usage
if __name__ == "__main__":
    # Upload single image
    # upload_image("path/to/unit1.jpg")
    
    # Upload single video
    # upload_video("path/to/unit1.mp4")
    
    # Batch upload all images in a folder
    # batch_upload("./images/learner_units", "image")
    
    # Batch upload all videos
    # batch_upload("./videos/learner_units", "video")
    
    print("✅ Media upload complete!")

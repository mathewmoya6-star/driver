#!/usr/bin/env python3
"""
Python script to bulk upload images and videos to Supabase Storage
Run: python upload_media.py
"""

import os
import json
import base64
import requests
from pathlib import Path
from PIL import Image
import io

# Configuration
SUPABASE_URL = "https://fktjmkmzlixlapeyhhyl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdGpta216bGl4bGFwZXloaHlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE0OTM3MSwiZXhwIjoyMDkyNzI1MzcxfQ.2I7MqP0GqHqBvhMvLhQoEYm0K5C_9tQGtA6mTd0kP3g"

# Headers for Supabase API
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

STORAGE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

class MediaUploader:
    def __init__(self):
        self.supabase_url = SUPABASE_URL
        self.headers = HEADERS
        self.storage_headers = STORAGE_HEADERS
        
    def compress_image(self, image_path, max_size=(1200, 1200), quality=85):
        """Compress and convert image to WebP format"""
        try:
            img = Image.open(image_path)
            
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            # Resize if needed
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to bytes as WebP
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=quality, optimize=True)
            output.seek(0)
            
            return output.getvalue()
        except Exception as e:
            print(f"Error compressing {image_path}: {e}")
            return None
    
    def upload_to_storage(self, file_data, filename, bucket="materials"):
        """Upload file to Supabase Storage"""
        url = f"{self.supabase_url}/storage/v1/object/{bucket}/{filename}"
        
        response = requests.post(
            url,
            headers=self.storage_headers,
            data=file_data,
            params={"cacheControl": "3600"}
        )
        
        if response.status_code in [200, 201]:
            public_url = f"{self.supabase_url}/storage/v1/object/public/{bucket}/{filename}"
            return public_url
        else:
            print(f"Upload failed: {response.status_code} - {response.text}")
            return None
    
    def upload_image(self, image_path, module_type, unit_number, size_type="main"):
        """Upload a single image with optimization"""
        if not os.path.exists(image_path):
            print(f"File not found: {image_path}")
            return None
        
        # Determine dimensions based on size type
        if size_type == "thumbnail":
            max_size = (200, 150)
            quality = 70
        elif size_type == "small":
            max_size = (400, 400)
            quality = 75
        elif size_type == "medium":
            max_size = (800, 800)
            quality = 80
        else:  # main/large
            max_size = (1200, 1200)
            quality = 85
        
        # Compress image
        compressed = self.compress_image(image_path, max_size, quality)
        if not compressed:
            return None
        
        # Generate filename
        timestamp = int(os.path.getmtime(image_path))
        original_name = os.path.splitext(os.path.basename(image_path))[0]
        filename = f"{module_type}/unit{unit_number}_{size_type}_{timestamp}.webp"
        
        # Upload
        public_url = self.upload_to_storage(compressed, filename, "materials")
        
        if public_url:
            print(f"✓ Uploaded: {public_url}")
        
        return public_url
    
    def update_material_image(self, module_type, unit_number, image_url, thumbnail_url=None):
        """Update database with image URLs"""
        update_data = {"image_url": image_url}
        if thumbnail_url:
            update_data["thumbnail_url"] = thumbnail_url
        
        url = f"{self.supabase_url}/rest/v1/materials"
        params = {
            "module_type": f"eq.{module_type}",
            "unit_number": f"eq.{unit_number}"
        }
        
        response = requests.patch(
            url,
            headers=self.headers,
            params=params,
            json=update_data
        )
        
        if response.status_code in [200, 204]:
            print(f"  ✓ Database updated for Unit {unit_number}")
            return True
        else:
            print(f"  ✗ Database update failed: {response.status_code}")
            return False
    
    def batch_upload_units(self, module_type, unit_range=(1, 21), image_folder="./media/learner_units"):
        """Batch upload all images for a module"""
        results = []
        
        for unit_num in range(unit_range[0], unit_range[1] + 1):
            print(f"\n📦 Processing Unit {unit_num}...")
            
            # Paths for different image sizes
            main_path = os.path.join(image_folder, f"unit{unit_num}_main.jpg")
            thumb_path = os.path.join(image_folder, f"unit{unit_num}_thumb.jpg")
            
            uploaded_urls = {}
            
            # Upload main image
            if os.path.exists(main_path):
                main_url = self.upload_image(main_path, module_type, unit_num, "main")
                if main_url:
                    uploaded_urls["main"] = main_url
            
            # Upload thumbnail
            if os.path.exists(thumb_path):
                thumb_url = self.upload_image(thumb_path, module_type, unit_num, "thumbnail")
                if thumb_url:
                    uploaded_urls["thumbnail"] = thumb_url
            
            # Update database
            if uploaded_urls.get("main"):
                self.update_material_image(
                    module_type, 
                    unit_num, 
                    uploaded_urls.get("main"), 
                    uploaded_urls.get("thumbnail")
                )
                results.append({"unit": unit_num, "success": True})
            else:
                results.append({"unit": unit_num, "success": False, "error": "No image found"})
        
        return results
    
    def upload_youtube_videos(self, module_type, youtube_ids):
        """Update database with YouTube video URLs"""
        for unit_num, video_id in youtube_ids.items():
            embed_url = f"https://www.youtube.com/embed/{video_id}"
            
            url = f"{self.supabase_url}/rest/v1/materials"
            params = {
                "module_type": f"eq.{module_type}",
                "unit_number": f"eq.{unit_num}"
            }
            
            response = requests.patch(
                url,
                headers=self.headers,
                params=params,
                json={"video_url": embed_url}
            )
            
            if response.status_code in [200, 204]:
                print(f"✓ YouTube video added to Unit {unit_num}")
            else:
                print(f"✗ Failed for Unit {unit_num}: {response.status_code}")

def main():
    uploader = MediaUploader()
    
    print("🚀 MEI DRIVE AFRICA - Media Uploader\n")
    print("=" * 50)
    
    # YouTube video IDs for Learner Units
    youtube_ids = {
        1: "6JZtJjR6WMA",
        2: "9sXfZKjU7cg",
        3: "3sYRJ1DmMJg",
        4: "8lcXpUHv5OY",
        5: "T2R0nF2kSjA",
        6: "8VfNzQ4BhzA",
        7: "Xw2YyZqJ3Rc",
        8: "3tL2cMFm9EU",
        9: "TtFLI1Y9o54",
        10: "TMTiJQoYPhE",
        11: "afvTcAHW9A0",
        12: "7z5LpQ7P6wM",
        13: "8MjxJzH1jho",
        14: "5YJZfZpRqJk",
        15: "8DVYVfEjdM8",
        16: "FW6H44tqTn0",
        17: "6nZyd1QFe_E",
        18: "7vYqkZ8jK9c",
        19: "5QzDiJ4EIsI",
        20: "EP_uu6JTT-A",
        21: "9yAKbW9yAGo"
    }
    
    print("\n📹 Adding YouTube videos to all units...")
    uploader.upload_youtube_videos("learner", youtube_ids)
    
    print("\n" + "=" * 50)
    print("\n📸 Uploading images to Supabase Storage...")
    
    # Make sure you have images in ./media/learner_units/
    # Create folder structure: media/learner_units/unit1_main.jpg, unit1_thumb.jpg, etc.
    
    # Uncomment to upload images:
    # results = uploader.batch_upload_units(
    #     module_type="learner",
    #     unit_range=(1, 21),
    #     image_folder="./media/learner_units"
    # )
    # 
    # print("\n📊 Upload Summary:")
    # success_count = sum(1 for r in results if r["success"])
    # print(f"✅ Successfully uploaded: {success_count}/21 units")
    
    print("\n⚠️  Note: To upload images, place them in ./media/learner_units/")
    print("   Filename format: unit{N}_main.jpg and unit{N}_thumb.jpg")
    
    print("\n✅ Script completed!")

if __name__ == "__main__":
    main()

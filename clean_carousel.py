import os
import os.path

carousel_dir = r'C:\Users\aayus\WebstormProjects\xordium-website-5.0\src\frontend\carousel-source'

# Get all files
all_files = os.listdir(carousel_dir)
print("Files before:", all_files)

# Delete .png and .jpg files
for f in all_files:
    ext = os.path.splitext(f)[1].lower()
    if ext in ['.png', '.jpg', '.jpeg']:
        full_path = os.path.join(carousel_dir, f)
        os.remove(full_path)
        print(f"Deleted: {f}")

# List remaining files
remaining = [f for f in all_files if f != '.gitkeep']
print("Files after removing originals:", remaining)
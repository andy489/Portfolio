import os
from PIL import Image

input_path = "./static/images/avatars/avatar-05.png"
output_path = "static/images/avatars/avatar-05.png"

try:
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
    else:
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path) / 1024

        # Save compressed PNG version
        # For PNG compression, we can use:
        # 1. `optimize=True` - extra processing to reduce file size
        # 2. `compress_level` parameter (0-9, default is 6, 9 is maximum compression)

        # Try with maximum compression first
        img.save(output_path, format="PNG", optimize=True, compress_level=9)
        compressed_size = os.path.getsize(output_path) / 1024

        print(f"Original: {original_size:.1f} KB")
        print(f"Compressed (level 9): {compressed_size:.1f} KB")

        # If still too big and image has transparency, try reducing colors
        if compressed_size > 350 and img.mode == "RGBA":
            print("\nTrying palette mode with reduced colors...")

            # Convert to palette mode with adaptive colors
            # 256 colors max (palette mode)
            img_palette = img.convert("P", palette=Image.ADAPTIVE, colors=256)

            # Save palette image
            img_palette.save(output_path, format="PNG", optimize=True, compress_level=9)
            compressed_size = os.path.getsize(output_path) / 1024

            print(f"Compressed with palette (256 colors): {compressed_size:.1f} KB")

        print(f"Saved to: {output_path}")

except Exception as e:
    print(f"Error: {str(e)}")
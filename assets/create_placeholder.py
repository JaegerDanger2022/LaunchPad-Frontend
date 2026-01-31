from PIL import Image, ImageDraw

# Create 1024x1024 icon (adaptive-icon)
img = Image.new('RGB', (1024, 1024), color='#FF6B35')
draw = ImageDraw.Draw(img)
img.save('adaptive-icon.png')

# Create 1024x1024 icon (regular icon)
img2 = Image.new('RGB', (1024, 1024), color='#FF6B35')
img2.save('icon.png')

# Create splash screen
splash = Image.new('RGB', (1242, 2688), color='#FFFFFF')
draw = ImageDraw.Draw(splash)
# Draw orange circle in center
draw.ellipse([471, 994, 771, 1294], fill='#FF6B35')
splash.save('splash-icon.png')

# Create notification icon (96x96)
notif = Image.new('RGBA', (96, 96), color=(255, 107, 53, 255))
notif.save('notification-icon.png')

print("Created all placeholder icons!")

from PIL import Image

def get_gradient_colors():
    try:
        im = Image.open('frontend/public/images/Inicio-opcion-1.jpg')
        w, h = im.size
        # Sample colors at different regions
        colors = []
        for y in [0, h//4, h//2, 3*h//4, h-1]:
            row = []
            for x in [0, w//4, w//2, 3*w//4, w-1]:
                r, g, b = im.getpixel((x, y))[:3]
                row.append(f"#{r:02x}{g:02x}{b:02x}")
            colors.append(row)
        for idx, row in enumerate(colors):
            print(f"Row {idx}: {row}")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    get_gradient_colors()

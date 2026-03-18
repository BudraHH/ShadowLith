import pytesseract
import os
from PIL import Image, ImageOps
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ShadowLithOCR")

class TextBuffer:
    def __init__(self, tesseract_path: str):
        self.parts = []
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

    def _preprocess_image(self, img: Image.Image) -> Image.Image:
        # converting to grayscale
        img = ImageOps.grayscale(img)
        if img.width < 1000:
            img = img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS)
        return img

    def add(self, image_path: str, config: str = '--psm 6') -> bool:
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return False

        try: 
            with Image.open(image_path) as img:
                processed_img = self._preprocess_image(img)
                text = pytesseract.image_to_string(processed_img, config=config)

                clean_text = text.strip()
                if clean_text:
                    self.parts.append(clean_text)
                    return True
                else:
                    logger.warning(f"No text extracted from image: {image_path}")
                    return False
        except Exception as e:
            logger.error(f"Failed to process image: {image_path}. Error: {str(e)}")
            return False

    def get_full_text(self) -> str:
        return "\n\n".join(self.parts)

    def clear(self) -> None:
        self.parts = []


# if __name__ == "__main__":
#     buffer = TextBuffer("/usr/bin/tesseract")
#     print("Buffer Initialized!")
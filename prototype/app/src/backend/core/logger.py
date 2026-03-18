import logging
import sys
from .config import Config

def setup_logger():
    logger = logging.getLogger("ShadowLith")
    logger.setLevel(logging.DEBUG if Config.DEBUG else logging.INFO)
    
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s',
        datefmt='%H:%M:%S'
    )

    # 1. Console Handler (Standard Output)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 2. File Handler (Persistent Log)
    file_handler = logging.FileHandler(Config.LOG_FILE, encoding='utf-8')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

# Singleton instance
logger = setup_logger()
logger.info(f"\n\n--- ShadowLith Logging Initialized (Debug: {Config.DEBUG}) ---")

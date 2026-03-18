import functools
import traceback
import json
from .logger import logger

def bridge_safe(func):
    """
    Decorator to protect the PyWebView bridge from Python exceptions.
    Ensures that errors are logged and returned as a safe status instead of crashing the UI.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_msg = f"Unexpected error in {func.__name__}: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            
            # If it's a bridge call, we want to return something the UI can handle
            return {
                "status": "error",
                "message": str(e),
                "blocks": [{
                    "type": "warning",
                    "content": f"SYSTEM ERROR: {str(e)}"
                }]
            }
    return wrapper

def latency_timer(func):
    """
    Decorator to measure and log the execution time of critical functions.
    """
    import time
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        duration = (end_time - start_time) * 1000
        logger.debug(f"LATENCY: {func.__name__} took {duration:.2f}ms")
        return result
    return wrapper

import os
import subprocess
import sys
import shutil
from pathlib import Path

# Config
ROOT_DIR = Path(r"D:\projects\ShadowLith\prototype\app")
FRONTEND_DIR = ROOT_DIR / "src" / "frontend"
BACKEND_DIR = ROOT_DIR / "src" / "backend"
BUILD_DIR = ROOT_DIR / "build"
VENV_PYTHON = BACKEND_DIR / "venv" / "Scripts" / "python.exe"
PYINSTALLER = BACKEND_DIR / "venv" / "Scripts" / "pyinstaller.exe"

def run_command(command, cwd, shell=True):
    print(f"Executing: {command} in {cwd}")
    # We use subprocess.Popen to stream the output if possible, or just run and wait
    process = subprocess.Popen(command, cwd=cwd, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line, end="")
    process.wait()
    if process.returncode != 0:
        print(f"Error: Command failed with exit code {process.returncode}")
        # sys.exit(process.returncode)
        return False
    return True

def main():
    print("=== ShadowLith Build Process Started ===")
    
    # Ensure build directory is clean
    if BUILD_DIR.exists():
        print(f"Cleaning existing build directory: {BUILD_DIR}")
        # shutil.rmtree(BUILD_DIR) # Be careful with rmtree on user machine
    BUILD_DIR.mkdir(exist_ok=True)

    # 1. Build Frontend
    print("\n--- [Step 1/3] Building Frontend (React) ---")
    if not (FRONTEND_DIR / "node_modules").exists():
        print("node_modules not found, running npm install...")
        if not run_command("npm install", FRONTEND_DIR):
            print("Frontend install failed.")
            return

    if not run_command("npm run build", FRONTEND_DIR):
        print("Frontend build failed.")
        return

    # 2. Build Backend with PyInstaller
    print("\n--- [Step 2/3] Building Backend (PyInstaller) ---")
    
    pyinstaller_cmd = [
        f'"{str(PYINSTALLER)}"',
        "--noconsole",
        "--hide-console hide-early",
        "--onefile",
        "--name=ShadowLith",
        f'--distpath="{str(BUILD_DIR)}"',
        '--add-data="ui;ui"',
        '--add-data="src;src"',
        '--collect-all="webview"',
        '--collect-all="PyQt6"',
        "--clean", # Clear cache to ensure fresh build
        "main.py"
    ]
    
    cmd_str = " ".join(pyinstaller_cmd)
    if not run_command(cmd_str, BACKEND_DIR):
        print("PyInstaller build failed.")
        return

    # 3. Finalize
    print("\n--- [Step 3/3] Finalizing Build ---")
    
    # Copy .env.example as .env to the build folder
    source_env = BACKEND_DIR / ".env.example"
    dest_env = BUILD_DIR / ".env"
    if source_env.exists():
        print(f"Copying {source_env.name} to {dest_env}")
        shutil.copy(source_env, dest_env)
    
    print("\n" + "="*40)
    print("SUCCESS: ShadowLith build completed!")
    print(f"Location: {BUILD_DIR}")
    print("="*40)

if __name__ == "__main__":
    main()

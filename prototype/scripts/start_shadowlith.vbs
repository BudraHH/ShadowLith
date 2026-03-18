Set objShell = CreateObject("WScript.Shell")

' Set the working directory to the backend folder
objShell.CurrentDirectory = "D:\projects\ShadowLith\prototype\app\src\backend"

' Path to the Python executable inside the virtual environment
pythonPath = """D:\projects\ShadowLith\prototype\app\src\backend\venv\Scripts\python.exe"""

' The script we want to run
scriptPath = "main.py"

' Run the application
' 0 = Hide the command prompt window (creates a clean, background launch like a real app)
' 1 = Show the command prompt window (useful if you want to see console printouts)
' False = Do not wait for the script to finish before the VBScript exits
objShell.Run pythonPath & " " & scriptPath, 0, False

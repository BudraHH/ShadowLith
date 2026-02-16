#!/bin/bash

# setup_stealth.sh
# Installs dependencies for the Hardware-Isolated Stealth Layer
# (Ubuntu 24.04 compatible)

echo ">>> ShadowLith: Installing Stealth Dependencies..."

# Basic Virtual Framebuffer and Utilities
sudo apt-get update
sudo apt-get install -y xvfb x11vnc xdotool

# Viewer: We recommend 'xtightvncviewer' for simplicity and speed
sudo apt-get install -y xtightvncviewer

# Optional: Performance (Hardware Acceleration)
# sudo apt-get install -y mesa-utils

echo ">>> Installation Complete."
echo ">>> Run 'python3 backend/main.py --stealth' to activate Virtual Isolation."

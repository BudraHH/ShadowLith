
import soundcard as sc
import numpy as np
import time

def test_loopback_capture(duration=5):
    print("🔍 Scanning for Loopback Devices...")
    
    # On Windows with soundcard, to record system audio, we usually look for a microphone
    # that represents the "Loopback" of the speakers.
    # soundcard.all_microphones(include_loopback=True) returns all input devices.
    
    try:
        # Get the default speaker to know what to listen to
        default_speaker = sc.default_speaker()
        print(f"🎧 Default Speaker: {default_speaker.name}")
        
        # Try to get the loopback mic for this speaker
        # The API can be tricky, so we'll try the most robust method for Windows WASAPI
        
        # Method 1: Get the default microphone for loopback (if supported)
        # Note: 'soundcard' often exposes loopback via sc.get_microphone with include_loopback=True
        
        mics = sc.all_microphones(include_loopback=True)
        loopback_mic = None
        
        # Simple heuristic: look for a mic with the same name as the speaker (often how loopback is labeled)
        # or labeled "Loopback"
        for mic in mics:
            if default_speaker.name in mic.name or "Loopback" in mic.name:
                loopback_mic = mic
                break
        
        # Fallback: Just use the first loopback device found if specific match fails
        if not loopback_mic:
            for mic in mics:
                if mic.isloopback:
                    loopback_mic = mic
                    break
                    
        if not loopback_mic:
             # Last resort: Try getting a mic with the exact ID of the speaker (sometimes works)
             try:
                 loopback_mic = sc.get_microphone(id=default_speaker.id, include_loopback=True)
             except:
                 pass

        if loopback_mic:
            print(f"🎤 Found Loopback Device: {loopback_mic.name}")
            print(f"🔴 Capturing system audio for {duration} seconds... (Please play audio NOW!)")
            
            # Soundcard throws warnings if the buffer is empty (glitch), we can ignore them for this test
            import warnings
            warnings.filterwarnings("ignore")

            with loopback_mic.recorder(samplerate=44100) as recorder:
                start_time = time.time()
                while time.time() - start_time < duration:
                    try:
                        # Record a chunk
                        data = recorder.record(numframes=4410) # 0.1s
                        
                        # Calculate volume
                        volume = np.sqrt(np.mean(data**2))
                        
                        if volume > 0.001:
                            bars = "█" * int(volume * 50)
                            print(f"🔊 {bars}")
                        else:
                            # Print a dot to show it's still running during silence
                            print(".", end="", flush=True)
                    except Exception as e:
                        print(f"Stream error: {e}")
                        pass
        else:
            print("❌ Could not auto-detect a specific Loopback device.")
            print("Available Inputs:")
            for m in mics:
                print(f" - {m.name} (Loopback: {m.isloopback})")

    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_loopback_capture()

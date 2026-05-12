import os
import re

src_dir = '/Users/user/Desktop/chess/chess-arquitectura/frontend/frontend/src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content
            
            # Replace `http://${window.location.hostname}:8000` with `` (empty string) to make it relative
            # Actually we just replace `http://${window.location.hostname}:8000/ to `/
            new_content = new_content.replace('`http://${window.location.hostname}:8000/', '`/')
            new_content = new_content.replace('`ws://${window.location.hostname}:8000/', '`ws://${window.location.hostname}:5173/') # websocket should go to the Vite proxy

            # Also replace any stray http://localhost:8000/ or http://127.0.0.1:8000/ just in case
            new_content = new_content.replace('"http://localhost:8000/', '"/')
            new_content = new_content.replace('"http://127.0.0.1:8000/', '"/')
            new_content = new_content.replace('`http://localhost:8000/', '`/')
            new_content = new_content.replace('`http://127.0.0.1:8000/', '`/')

            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

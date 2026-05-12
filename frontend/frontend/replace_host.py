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
            
            # Replace double quotes "http://localhost:8000..."
            new_content = re.sub(r'"http://localhost:8000([^"]*)"', r'`http://${window.location.hostname}:8000\1`', new_content)
            # Replace single quotes 'http://localhost:8000...'
            new_content = re.sub(r"'http://localhost:8000([^']*)'", r'`http://${window.location.hostname}:8000\1`', new_content)
            # Replace inside backticks `http://localhost:8000...`
            new_content = re.sub(r'`http://localhost:8000([^`]*)`', r'`http://${window.location.hostname}:8000\1`', new_content)

            # Websockets
            new_content = re.sub(r'"ws://localhost:8000([^"]*)"', r'`ws://${window.location.hostname}:8000\1`', new_content)
            new_content = re.sub(r"'ws://localhost:8000([^']*)'", r'`ws://${window.location.hostname}:8000\1`', new_content)
            new_content = re.sub(r'`ws://localhost:8000([^`]*)`', r'`ws://${window.location.hostname}:8000\1`', new_content)

            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

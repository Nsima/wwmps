import os
import re

SRT_FOLDER = "subtitles"
OUTPUT_FOLDER = "clean_text"

def clean_srt_content(srt_text):
    lines = srt_text.splitlines()
    cleaned_lines = []
    for line in lines:
        # Remove timestamps
        if re.match(r"\d{2}:\d{2}:\d{2},\d{3}", line):
            continue
        # Remove subtitle sequence numbers
        if line.strip().isdigit():
            continue
        # Remove tags like [Music], [Applause], etc.
        if re.match(r"^\[.*?\]$", line.strip(), re.IGNORECASE):
            continue
        # Strip special chars
        cleaned_line = re.sub(r"[^\w\s.,!?'-]", '', line).strip()
        if cleaned_line:
            cleaned_lines.append(cleaned_line)
    return ' '.join(cleaned_lines)

def process_all_srts():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    for filename in os.listdir(SRT_FOLDER):
        if filename.endswith(".srt"):
            srt_path = os.path.join(SRT_FOLDER, filename)
            with open(srt_path, "r", encoding="utf-8") as file:
                srt_content = file.read()

            cleaned_text = clean_srt_content(srt_content)

            output_name = os.path.splitext(filename)[0] + ".txt"
            output_path = os.path.join(OUTPUT_FOLDER, output_name)
            with open(output_path, "w", encoding="utf-8") as out_file:
                out_file.write(cleaned_text)

            print(f"[✔] Cleaned: {filename} → {output_name}")

if __name__ == "__main__":
    process_all_srts()

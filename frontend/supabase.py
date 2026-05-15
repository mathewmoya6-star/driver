import re
from docx import Document
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://jeksrwrzzrczamxijvwl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_docx(file_path):
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

def extract_units(text):
    # Split by UNIT X: pattern
    units_raw = re.split(r'(UNIT \d+:.*?)(?=UNIT \d+:|$)', text, flags=re.DOTALL)
    units = []
    for i in range(1, len(units_raw), 2):
        title_line = units_raw[i].strip()
        content = units_raw[i+1].strip() if i+1 < len(units_raw) else ""
        # Extract unit number
        match = re.match(r'UNIT (\d+):\s*(.*)', title_line)
        if match:
            num = int(match.group(1))
            title = match.group(2)
            units.append({
                "unit_number": num,
                "title": title,
                "content": content
            })
    return units

def upload_units(units):
    for unit in units:
        # Check if unit already exists
        existing = supabase.table("units").select("id").eq("unit_number", unit["unit_number"]).execute()
        if existing.data:
            supabase.table("units").update(unit).eq("unit_number", unit["unit_number"]).execute()
            print(f"Updated Unit {unit['unit_number']}")
        else:
            supabase.table("units").insert(unit).execute()
            print(f"Inserted Unit {unit['unit_number']}")

def extract_traffic_signs(text):
    # Find the TRAFFIC SIGNS section
    signs_section = re.search(r'# TRAFFIC SIGNS(.*?)(?=# MODEL TOWN ILLUSTRATIONS|$)', text, re.DOTALL)
    if not signs_section:
        return []
    signs_text = signs_section.group(1)
    # Simple extraction – you may need to refine based on your actual formatting
    # For demo, we'll just store the raw text for each category
    categories = {
        "regulatory": r'\(a\) Regulatory Signs(.*?)(?=\(b\) Warning Signs|$)',
        "warning": r'\(b\) Warning Signs(.*?)(?=\(c\) Information Signs|$)',
        "information": r'\(c\) Information Signs(.*?)(?=\(d\) Guidance Signs|$)',
        "guidance": r'\(d\) Guidance Signs(.*?)$'
    }
    signs = []
    for cat, pattern in categories.items():
        match = re.search(pattern, signs_text, re.DOTALL)
        if match:
            signs.append({
                "category": cat,
                "name": f"{cat.capitalize()} signs",
                "description": match.group(1).strip()[:1000]  # truncate
            })
    return signs

def upload_traffic_signs(signs):
    for sign in signs:
        supabase.table("traffic_signs").insert(sign).execute()
        print(f"Inserted {sign['category']} signs")

# Main execution
if __name__ == "__main__":
    # Convert your .docx to a .txt or parse directly
    # If you have the .docx file:
    # text = parse_docx("LEARNER Hub.docx")
    # Otherwise, if you have a .txt file with the extracted content:
    with open("learner_hub.txt", "r", encoding="utf-8") as f:
        text = f.read()

    units = extract_units(text)
    upload_units(units)

    signs = extract_traffic_signs(text)
    upload_traffic_signs(signs)

    print("Done! All data uploaded to Supabase.")

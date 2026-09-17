import docx
import sys

try:
    doc = docx.Document(r"C:\Users\fisto\Downloads\GROOMING DOCUMENT.docx")
    for para in doc.paragraphs:
        if para.text.strip():
            print(para.text.strip())
except Exception as e:
    print("Error:", e)

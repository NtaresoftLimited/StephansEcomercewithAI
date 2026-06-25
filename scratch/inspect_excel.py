import pandas as pd

file_path = r"C:\Users\fisto\Downloads\inventory_aligned.xlsx"
try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("\nFirst 5 rows:")
    print(df.head())
except Exception as e:
    print("Error:", e)

import pandas as pd

file_path = r"C:\Users\fisto\Downloads\inventory_aligned.xlsx"
df = pd.read_excel(file_path)
print("Unique Sub-submenus for 'Dog Food':")
print(df[df['Submenu'] == 'Dog Food']['Sub-submenu'].unique())

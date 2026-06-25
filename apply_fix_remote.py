import paramiko
import os

HOST = "166.1.227.63"
USER = "root"
PASSWORD = "yCiEf6P2c,soWK"

# Using absolute paths on the Windows side
LOCAL_FILE = r"D:\CODEX\STEPHANS OG\stephans-pet-app\res_config_setting_fixed.py"
REMOTE_FILE = "/opt/odoo/custom-addons/bi_pos_paid_posted_order_delete/models/res_config_setting.py"

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"🚀 Connecting to {HOST}...")
        client.connect(HOST, username=USER, password=PASSWORD, timeout=10)
        sftp = client.open_sftp()
        
        if not os.path.exists(LOCAL_FILE):
            print(f"❌ Error: Local file not found: {LOCAL_FILE}")
            return
            
        print(f"📤 Uploading fix: {LOCAL_FILE} -> {REMOTE_FILE}")
        sftp.put(LOCAL_FILE, REMOTE_FILE)
        sftp.close()
        
        print("🔄 Restarting Odoo Service...")
        # Based on the previous deploy script: sudo systemctl restart odoo (or stop/start)
        stdin, stdout, stderr = client.exec_command("sudo systemctl restart odoo")
        
        # Give it a few seconds and check status
        import time
        time.sleep(2)
        
        stdin, stdout, stderr = client.exec_command("sudo systemctl status odoo")
        status = stdout.read().decode()
        if "active (running)" in status:
            print("✅ Odoo service is active and running.")
        else:
            print("⚠️ Odoo service status check (please verify manually):")
            print(status)
            
        print("✨ Done.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()

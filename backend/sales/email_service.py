import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# =========================================================================
# CONFIGURATION ZA SEVA YA GOOGLE SMTP (CLEAN PRODUCTION RE-ROUTE)
# =========================================================================
SMTP_SERVER = "://gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "inocentcostantino8@gmail.com"  
SENDER_PASSWORD = "oqchtjqmmjdykacp" 

def send_end_of_day_report(sales_total, profit_total, expenses_total, low_stock_count, receiver_email):
    """Injini kuu inayopokea barua pepe ya Admin live kutoka database na kurusha ripoti."""
    subject = "📊 Ripoti ya SmartBiz Pro - Muhtasari wa Funga Duka Live"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; border-bottom: 2px dashed #0d9488; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="color: #0d9488; margin: 0; font-size: 24px;">SmartBiz Pro</h1>
                <p style="color: #64748b; margin: 5px 0 0 0;">Usimamizi thabiti wa biashara yako kidijitali</p>
            </div>
            
            <p>Habari <strong>Mkurugenzi Inocent</strong>,</p>
            <p>Duka lako limefungwa rasmi jioni hii. Hapa chini ni muhtasari kamili wa mahesabu na utendaji wa leo kutoka kwenye hifadhidata ya SQLite:</p>
            
            <!-- ACCOUNTS MATRIX -->
            <div style="margin: 20px 0; padding: 15px; background: #fafaf9; border-radius: 8px; border-left: 4px solid #0284c7;">
                <p style="margin: 5px 0;">💰 <strong>Jumla ya Mauzo ya Leo:</strong> <span style="color: #0284c7; font-weight: bold;">TSH {sales_total:,.2f}</span></p>
                <p style="margin: 5px 0;">💸 <strong>Matumizi ya Uendeshaji:</strong> <span style="color: #ef4444; font-weight: bold;">TSH {expenses_total:,.2f}</span></p>
                <hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 10px 0;">
                <p style="margin: 5px 0; font-size: 18px;">📈 <strong>FAIDA HALISI (Net Profit):</strong> <span style="color: #0d9488; font-weight: bold;">TSH {profit_total:,.2f}</span></p>
            </div>
            
            <!-- STOKI MONITOR -->
            <div style="margin: 20px 0; padding: 15px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f97316;">
                <p style="margin: 0; color: #c2410c;">⚠️ <strong>Tahadhari ya Ghala:</strong> Kuna bidhaa <strong>{low_stock_count}</strong> ambazo zimeisha stoki na mfumo umezitengenezea ripoti ya uagizaji kiotomatiki.</p>
            </div>
            
            <p style="font-style: italic; font-size: 13px; color: #64748b; margin-top: 25px; text-align: center;">
                Ripoti hii imezalishwa kiotomatiki na mfumo wa duka tarehe 15/10/2026. Usiijibu barua pepe hii.
            </p>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email  
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        server.quit()
        print(f"🚀 [EMAIL SUCCESS]: Ripoti kuu ya funga duka imetumwa kwa mafanikio kwenda: {receiver_email}")
    except Exception as e:
        print("❌ [EMAIL ERROR]: Google SMTP imekataa kupitisha ripoti:", e)

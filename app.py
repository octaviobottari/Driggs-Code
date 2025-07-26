from flask import Flask, request, redirect, url_for, render_template, flash
from flask_talisman import Talisman
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))  # Use environment variable in Render

# Force HTTPS (required for custom domain + SSL)
Talisman(app, content_security_policy=None)

# Email configuration (never hardcode passwords)
smtp_server = "smtp.gmail.com"
smtp_port = 587
sender_email = os.getenv("SENDER_EMAIL")  # e.g., "octaviobottari7@gmail.com"
password = os.getenv("EMAIL_PASSWORD")    # App password from Gmail

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/send_email', methods=['POST'])
def send_email():
    try:
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        message = request.form.get('message', '').strip()

        if not name or not email or not message:
            flash("All fields are required!", "error")
            return redirect(url_for('index'))

        subject = f"Driggs Code - Message from {name} ({email})"
        body = f"Message: {message}\n\nContact Info:\nName: {name}\nEmail: {email}"

        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = sender_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, sender_email, msg.as_string())

        flash("Email sent successfully!", "success")
        return redirect(url_for('index'))

    except smtplib.SMTPAuthenticationError:
        flash("Authentication failed. Check your email credentials.", "error")
        return redirect(url_for('index'))
    except smtplib.SMTPException as e:
        flash(f"Failed to send email: {str(e)}", "error")
        return redirect(url_for('index'))
    except Exception as e:
        flash(f"An unexpected error occurred: {str(e)}", "error")
        return redirect(url_for('index'))

# Only used for local development (Render will use gunicorn)
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)

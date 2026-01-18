from flask import Flask, request, flash, redirect, render_template, url_for
import re
import os
from dotenv import load_dotenv
import resend

from keep_alive import KeepAliveService

load_dotenv()
app = Flask(__name__, static_folder='static',
            static_url_path='/static')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')

resend.api_key = os.getenv('RESEND_API_KEY')

# ===== Keep-Alive Initialization =====
RENDER_URL = os.getenv('RENDER_URL', 'https://andy-tn7s.onrender.com')
# Initialize and start the keep-alive service
keep_alive = KeepAliveService(url=RENDER_URL)

# Start the service when Flask app starts
keep_alive_started = False

def start_keep_alive_once():
    """Start keep-alive service once (Flask 2.3+ compatible)"""
    global keep_alive_started
    if not keep_alive_started:
        keep_alive.start()
        keep_alive_started = True
        print(f"[App] Keep-alive service initialized for {RENDER_URL}")

# Register with Flask app context
@app.before_request
def before_request_handler():
    """Start keep-alive on first request"""
    start_keep_alive_once()
# ===== End Keep-Alive Configuration =====

@app.route('/')
def home():
    return render_template("index.html",
                           active_page='about')


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('fullname', '').strip()
        email = request.form.get('email', '').strip()
        message = request.form.get('message', '').strip()

        errors = []

        if not name:
            errors.append('Full name is required')
        elif len(name) > 100:
            errors.append('Name is too long')

        if not email:
            errors.append('Email is required')
        elif not validate_email(email):
            errors.append('Invalid email format')

        if not message:
            errors.append('Message is required')
        elif len(message) > 2000:
            errors.append('Message is too long')

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('index.html',
                                   active_page='contact',
                                   form_data={
                                       'fullname': name,
                                       'email': email,
                                       'message': message
                                   })

        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Message:</strong></p>
                <p>{message}</p>
                <hr>
                <p><em>This message was sent from your portfolio website contact form.</em></p>
            </body>
            </html>
            """

            text_content = f"""
            New contact form submission:

            Name: {name}
            Email: {email}
            Message:
            {message}

            ---
            This message was sent from your portfolio website contact form.
            """

            sender_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
            recipient_email = os.getenv('RESEND_TO_EMAIL')

            if not recipient_email:
                raise ValueError("RESEND_TO_EMAIL environment variable is not set")

            params = {
                "from": f"Portfolio Contact <{sender_email}>",
                "to": [recipient_email],
                "subject": f'New Contact Form Submission from {name}',
                "html": html_content,
                "text": text_content,
                "reply_to": email
            }

            email_response = resend.Emails.send(params)

            print(f"Contact Form Submission:")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Message: {message}")
            print(f"Email sent successfully! Response ID: {email_response.get('id')}")

            flash('Message sent successfully!', 'success')
            return redirect(url_for('contact'))

        except Exception as e:
            error_message = str(e)
            print(f"Error sending email: {error_message}")

            # Provide user-friendly error message
            if "authentication" in error_message.lower():
                flash('Email service configuration error. Please contact the site administrator.', 'error')
            elif "connection" in error_message.lower():
                flash('Could not connect to email service. Please try again later.', 'error')
            elif "RESEND_TO_EMAIL" in error_message:
                flash('Email recipient not configured. Please contact site administrator.', 'error')
            elif "rate limit" in error_message.lower():
                flash('Email service temporarily unavailable. Please try again in a few minutes.', 'error')
            else:
                flash('Error sending message. Please try again later.', 'error')

            return render_template('index.html',
                                   active_page='contact',
                                   form_data={
                                       'fullname': name,
                                       'email': email,
                                       'message': message
                                   })

    # GET request
    return render_template('index.html',
                           active_page='contact',
                           form_data={
                               'fullname': '',
                               'email': '',
                               'message': ''
                           })


if __name__ == "__main__":
    # Start keep-alive immediately when running directly
    start_keep_alive_once()

    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

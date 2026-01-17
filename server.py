from datetime import datetime

from flask import Flask, request, flash, redirect, render_template, jsonify, url_for
from flask_mail import Mail, Message
import re
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder='static',
            static_url_path='/static')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Initialize Flask-Mail
mail = Mail(app)


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
            # Prepare email message
            msg = Message(
                subject=f'New Contact Form Submission from {name}',
                recipients=[app.config['MAIL_USERNAME']],  # Send to yourself
                reply_to=email  # So you can reply directly to the sender
            )

            # Email body
            msg.body = f"""
            New contact form submission:

            Name: {name}
            Email: {email}
            Message:
            {message}

            ---
            This message was sent from your portfolio website contact form.
            """

            # HTML version (optional)
            msg.html = f"""
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

            # Send the email
            mail.send(msg)

            print(f"Contact Form Submission:")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Message: {message}")
            print(f"Email sent successfully!")

            flash('Message sent successfully!', 'success')
            return redirect(url_for('contact'))

        except Exception as e:
            error_message = str(e)
            print(f"Error sending email: {error_message}")

            # Provide user-friendly error message
            if "authentication failed" in error_message.lower():
                flash('Email configuration error. Please contact the site administrator.', 'error')
            elif "connection refused" in error_message.lower():
                flash('Could not connect to email server. Please try again later.', 'error')
            else:
                flash(f'Error sending message: {error_message}', 'error')

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
    app.run(debug=False)

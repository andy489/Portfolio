import os
import re
from typing import Dict, Tuple
import resend


class EmailValidator:
    """Handles email validation logic"""

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None


class EmailService:
    """Handles email sending logic"""

    def __init__(self):
        self.resend_api_key = os.getenv('RESEND_API_KEY')
        self.sender_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
        self.recipient_email = os.getenv('RESEND_TO_EMAIL')
        self.validator = EmailValidator()

        if self.resend_api_key:
            resend.api_key = self.resend_api_key

    def validate_contact_form(self, name: str, email: str, message: str) -> Tuple[bool, list]:
        """Validate contact form data"""
        errors = []

        if not name:
            errors.append('Full name is required')
        elif len(name) > 100:
            errors.append('Name is too long')

        if not email:
            errors.append('Email is required')
        elif not self.validator.validate_email(email):
            errors.append('Invalid email format')

        if not message:
            errors.append('Message is required')
        elif len(message) > 2000:
            errors.append('Message is too long')

        return len(errors) == 0, errors

    def create_email_content(self, name: str, email: str, message: str) -> Dict:
        """Create email content for contact form submission"""
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

        return {
            "html": html_content,
            "text": text_content
        }

    def send_contact_email(self, name: str, email: str, message: str) -> Dict:
        """Send contact form email"""
        if not self.recipient_email:
            raise ValueError("RESEND_TO_EMAIL environment variable is not set")

        email_content = self.create_email_content(name, email, message)

        params = {
            "from": f"Portfolio Contact <{self.sender_email}>",
            "to": [self.recipient_email],
            "subject": f'New Contact Form Submission from {name}',
            "html": email_content["html"],
            "text": email_content["text"],
            "reply_to": email
        }

        return resend.Emails.send(params)
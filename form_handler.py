from typing import Dict
from flask import flash
from email_service import EmailService


class FormHandler:
    """Handles contact form processing"""

    def __init__(self):
        self.email_service = EmailService()

    def process_contact_form(self, form_data: Dict) -> Dict:
        """
        Process contact form submission

        Returns:
            Dict containing:
            - success: bool
            - message: str (flash message)
            - category: str (flash category)
            - redirect: bool
        """
        name = form_data.get('fullname', '').strip()
        email = form_data.get('email', '').strip()
        message = form_data.get('message', '').strip()

        # Validate form
        is_valid, errors = self.email_service.validate_contact_form(name, email, message)

        if not is_valid:
            for error in errors:
                flash(error, 'error')
            return {
                'success': False,
                'message': 'Form validation failed',
                'category': 'error',
                'redirect': False,
                'form_data': form_data
            }

        # Try to send email
        try:
            response = self.email_service.send_contact_email(name, email, message)
            print(f"Email sent successfully! Response ID: {response.get('id')}")

            flash('Message sent successfully!', 'success')
            return {
                'success': True,
                'message': 'Message sent successfully!',
                'category': 'success',
                'redirect': True
            }

        except Exception as e:
            error_message = str(e)
            print(f"Error sending email: {error_message}")

            user_message = self._get_user_friendly_error(error_message)
            flash(user_message, 'error')

            return {
                'success': False,
                'message': user_message,
                'category': 'error',
                'redirect': False,
                'form_data': form_data
            }

    def _get_user_friendly_error(self, error_message: str) -> str:
        """Convert technical errors to user-friendly messages"""
        error_lower = error_message.lower()

        if "authentication" in error_lower:
            return 'Email service configuration error. Please contact the site administrator.'
        elif "connection" in error_lower:
            return 'Could not connect to email service. Please try again later.'
        elif "RESEND_TO_EMAIL" in error_message:
            return 'Email recipient not configured. Please contact site administrator.'
        elif "rate limit" in error_lower:
            return 'Email service temporarily unavailable. Please try again in a few minutes.'
        else:
            return 'Error sending message. Please try again later.'
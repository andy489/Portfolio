from flask_wtf import FlaskForm
from flask_ckeditor import CKEditorField
from wtforms import StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, Optional
import bleach


class ContactForm(FlaskForm):
    """Contact form with CKEditor integration and validation"""
    fullname = StringField('Full Name', validators=[
        DataRequired(message='Full name is required'),
        Length(min=2, max=100, message='Name must be between 2 and 100 characters')
    ], render_kw={
        "class": "form-input",
        "placeholder": "Your full name",
        "autocomplete": "name"
    })

    email = StringField('Email Address', validators=[
        DataRequired(message='Email is required'),
        Email(message='Invalid email address'),
        Length(max=120, message='Email is too long')
    ], render_kw={
        "class": "form-input",
        "placeholder": "your.email@example.com",
        "autocomplete": "email"
    })

    # CKEditor field for rich text editing
    message = CKEditorField('Message', validators=[
        DataRequired(message='Message is required'),
        Length(min=10, max=5000, message='Message must be between 10 and 5000 characters')
    ], render_kw={
        "class": "form-input",
        "placeholder": "Type your message here...",
        "rows": 6
    })

    submit = SubmitField('Send Message', render_kw={
        "class": "form-btn",
        "data-form-btn": ""
    })

    @staticmethod
    def sanitize_html(html_content):
        """Safely sanitize HTML content to prevent XSS attacks"""
        allowed_tags = {
            'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
            'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 'strong', 'ul',
            'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
        }

        allowed_attrs = {
            'a': {'href', 'title', 'target'},
            'img': {'src', 'alt', 'width', 'height'},
            '*': {'class', 'style'}
        }

        protocols = {'http', 'https', 'mailto'}

        cleaned_html = bleach.clean(
            html_content,
            tags=allowed_tags,
            attributes=allowed_attrs,
            protocols=protocols,
            strip=True
        )

        cleaned_html = bleach.linkify(cleaned_html)
        return cleaned_html
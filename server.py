from flask import Flask, request, flash, redirect, render_template, url_for
import os
from dotenv import load_dotenv

from keep_alive_service import KeepAliveService
from form_handler import FormHandler

load_dotenv()


class PortfolioApp:
    """Main Flask application class"""

    def __init__(self):
        self.app = Flask(__name__, static_folder='static', static_url_path='/static')
        self.app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')

        # Initialize services
        self.form_handler = FormHandler()
        self.keep_alive = None
        self.keep_alive_started = False

        # Setup routes
        self._setup_routes()
        self._setup_middleware()

    def _setup_routes(self):
        """Configure all routes"""

        @self.app.route('/')
        def home():
            return render_template("index.html", active_page='about')

        @self.app.route('/contact', methods=['GET', 'POST'])
        def contact():
            if request.method == 'POST':
                form_data = {
                    'fullname': request.form.get('fullname', '').strip(),
                    'email': request.form.get('email', '').strip(),
                    'message': request.form.get('message', '').strip()
                }

                result = self.form_handler.process_contact_form(form_data)

                if result['success'] and result['redirect']:
                    return redirect(url_for('contact'))
                else:
                    return render_template('index.html',
                                           active_page='contact',
                                           form_data=result.get('form_data', form_data))

            # GET request
            return render_template('index.html',
                                   active_page='contact',
                                   form_data={
                                       'fullname': '',
                                       'email': '',
                                       'message': ''
                                   })

    def _setup_middleware(self):
        """Setup middleware and before request handlers"""

        @self.app.before_request
        def before_request_handler():
            """Start keep-alive on first request"""
            self._start_keep_alive_once()

    def _start_keep_alive_once(self):
        """Start keep-alive service once"""
        if not self.keep_alive_started:
            render_url = os.getenv('RENDER_URL', 'https://andy-tn7s.onrender.com')
            self.keep_alive = KeepAliveService(url=render_url)
            self.keep_alive.start()
            self.keep_alive_started = True
            print(f"[App] Keep-alive service initialized for {render_url}")

    def run(self, debug: bool = True, host: str = '0.0.0.0', port: int = 5000):
        """Run the Flask application"""
        if not debug:  # Only start keep-alive in production
            self._start_keep_alive_once()

        self.app.run(debug=debug, host=host, port=port)


# Factory function to create app instance
def create_app():
    """Application factory"""
    return PortfolioApp().app


if __name__ == "__main__":
    portfolio_app = PortfolioApp()

    # portfolio_app.run(debug=True)
    portfolio_app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

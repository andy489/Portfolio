from flask import Flask, request, redirect, render_template, url_for, jsonify
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

        self.form_handler = FormHandler()
        self.keep_alive = None

        self._setup_routes()
        self._start_keep_alive()

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

        @self.app.route('/keep-alive')
        def keep_alive():
            """Endpoint for keep-alive service to ping"""
            return 'OK', 200

        @self.app.route('/health')
        def health_check():
            """Health check endpoint for Render's health monitoring"""
            return jsonify({
                'status': 'healthy',
                'service': 'portfolio-app'
            }), 200

        @self.app.route('/api/status')
        def status():
            """Status endpoint to check if keep-alive is running"""
            return jsonify({
                'keep_alive_running': self.keep_alive is not None and self.keep_alive.running,
                'app': 'running'
            }), 200

    def _start_keep_alive(self):
        """Start keep-alive service if running on Render"""
        # Check if we're running on Render
        is_render = os.environ.get('RENDER') == 'true' or os.environ.get('RENDER')

        # Only start keep-alive in production (not debug) and on Render
        if not self.app.debug and is_render:
            # Get Render external URL
            render_external_url = os.environ.get('RENDER_EXTERNAL_URL')

            if render_external_url:
                # Construct the keep-alive endpoint URL
                keep_alive_url = f"{render_external_url.rstrip('/')}/keep-alive"

                # Start the keep-alive service with 4-minute interval
                self.keep_alive = KeepAliveService(url=keep_alive_url, interval=240)
                self.keep_alive.start()

                print(f"✓ Keep-alive service started for: {keep_alive_url}")
                print(f"✓ Health check endpoint: {render_external_url.rstrip('/')}/health")
                print(f"✓ Status endpoint: {render_external_url.rstrip('/')}/api/status")
            else:
                print("⚠️  RENDER_EXTERNAL_URL not set - keep-alive service disabled")
        else:
            if self.app.debug:
                print("🔧 Debug mode - keep-alive service disabled")
            else:
                print("🌐 Not running on Render - keep-alive service disabled")

    def run(self, debug: bool = None, host: str = '0.0.0.0', port: int = 5000):
        """Run the Flask application"""
        # Determine debug mode
        if debug is None:
            debug = os.environ.get('FLASK_ENV') == 'development' or os.environ.get('DEBUG') == 'True'

        self.app.debug = debug

        print(f"🚀 Starting Portfolio App")
        print(f"   Host: {host}")
        print(f"   Port: {port}")
        print(f"   Debug: {debug}")
        print(f"   Environment: {'Development' if debug else 'Production'}")

        self.app.run(debug=debug, host=host, port=port)


def create_app():
    """Application factory for WSGI servers"""
    portfolio_app = PortfolioApp()
    return portfolio_app.app

portfolio_app_instance = PortfolioApp()
app = portfolio_app_instance.app

if __name__ == "__main__":
    portfolio_app = PortfolioApp()

    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))

    debug_mode = os.environ.get('FLASK_ENV') == 'development'

    portfolio_app.run(debug=debug_mode, port=port)
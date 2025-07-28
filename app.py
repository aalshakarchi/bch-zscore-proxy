import os
import logging
import requests
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from zscore_calculator import calculate_zscore

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Enable CORS for web applications
CORS(app)

@app.route('/')
def index():
    """Serve the main documentation and testing page"""
    return render_template('index.html')

@app.route('/calculate-zscore', methods=['POST'])
def api_calculate_zscore():
    """
    REST API endpoint that accepts dynamic JSON payloads
    and returns Z-score calculation results
    """
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json',
                'status': 'error'
            }), 400
        
        # Get JSON payload
        form_data = request.get_json()
        
        if not form_data:
            return jsonify({
                'error': 'Empty JSON payload provided',
                'status': 'error'
            }), 400
        
        # Log the incoming request for debugging
        app.logger.debug(f"Received payload: {form_data}")
        
        # Call the Z-score calculation function
        results = calculate_zscore(form_data)
        
        # Return structured JSON response
        return jsonify({
            'status': 'success',
            'data': results,
            'message': 'Z-score calculated successfully'
        })
        
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Network error calling BCH API: {str(e)}")
        return jsonify({
            'error': f'Failed to connect to BCH Z-Score Calculator: {str(e)}',
            'status': 'error'
        }), 503
        
    except ValueError as e:
        app.logger.error(f"Parsing error: {str(e)}")
        return jsonify({
            'error': f'Failed to parse response from BCH calculator: {str(e)}',
            'status': 'error'
        }), 502
        
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/docs')
def api_docs():
    """API documentation endpoint"""
    docs = {
        'title': 'BCH Z-Score Calculator API',
        'version': '1.0.0',
        'description': 'REST API wrapper for the Boston Children\'s Hospital Z-Score Calculator',
        'endpoints': {
            '/calculate-zscore': {
                'method': 'POST',
                'description': 'Calculate Z-score using dynamic form data',
                'content_type': 'application/json',
                'parameters': {
                    'required_fields': [
                        'HeightValue', 'WeightValue', 'AgeValue', 
                        'Context', 'Group', 'RegressionNum', 'XAxisValue', 'YAxisValue'
                    ]
                },
                'response': {
                    'success': {
                        'status': 'success',
                        'data': {
                            'ZScore': 'string',
                            'Percentile': 'string', 
                            '5th': 'string',
                            '50th': 'string',
                            '95th': 'string'
                        },
                        'message': 'string'
                    },
                    'error': {
                        'status': 'error',
                        'error': 'string'
                    }
                }
            }
        },
        'example_request': {
            'HeightValue': '172',
            'WeightValue': '32', 
            'AgeValue': '1',
            'Context': 'Echo',
            'Group': 'Aorta',
            'RegressionNum': '12',
            'XAxisValue': '1.11',
            'YAxisValue': '1.2'
        }
    }
    return jsonify(docs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

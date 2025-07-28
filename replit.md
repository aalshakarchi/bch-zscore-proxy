# Overview

This is a Flask-based REST API wrapper for the Boston Children's Hospital (BCH) Z-Score Calculator. The application acts as a proxy service that accepts JSON payloads, forwards them to the BCH calculator website, scrapes the results from the HTML response, and returns structured JSON data. It includes a web-based testing interface for easy API interaction and documentation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: Flask (Python web framework)
- **Architecture Pattern**: Simple MVC pattern with separation of concerns
- **Request Flow**: API endpoint → calculation service → external web scraping → JSON response
- **Error Handling**: Comprehensive exception handling for network errors and parsing failures

## Frontend Architecture
- **Technology**: Vanilla JavaScript with Bootstrap for UI
- **Pattern**: Single-page application with form-based interaction
- **Styling**: Bootstrap with dark theme and Font Awesome icons

# Key Components

## Core Application (`app.py`)
- Flask application setup with CORS enabled
- Main API endpoint `/calculate-zscore` that accepts POST requests
- Root route serving the documentation/testing interface
- Logging configuration for debugging

## Z-Score Calculator Service (`zscore_calculator.py`)
- Web scraping service using `requests` and `BeautifulSoup`
- Handles communication with BCH calculator at `https://zscore.chboston.org/`
- Parses HTML table responses to extract Z-score data
- Returns structured data: ZScore, Percentile, 5th, 50th, 95th percentiles

## Web Interface (`templates/index.html` + `static/app.js`)
- Interactive testing interface with form fields
- Example data loading functionality
- Real-time API testing capabilities
- Documentation display

# Data Flow

1. **Input**: Client sends JSON payload to `/calculate-zscore` endpoint
2. **Validation**: Flask validates JSON format and content
3. **External Call**: Service forwards data to BCH calculator website
4. **Scraping**: HTML response is parsed to extract Z-score table data
5. **Output**: Structured JSON response returned to client

## Data Format
- **Input**: Dynamic JSON with BCH calculator form fields (HeightValue, WeightValue, AgeValue, Context, Group, etc.)
- **Output**: JSON object with ZScore, Percentile, and percentile ranges (5th, 50th, 95th)

# External Dependencies

## Python Libraries
- **Flask**: Web framework and routing
- **Flask-CORS**: Cross-origin resource sharing support
- **requests**: HTTP client for external API calls
- **BeautifulSoup4**: HTML parsing and web scraping

## Frontend Libraries
- **Bootstrap**: CSS framework for responsive UI
- **Font Awesome**: Icon library
- **Vanilla JavaScript**: No additional framework dependencies

## External Services
- **BCH Z-Score Calculator**: Primary dependency on `https://zscore.chboston.org/`
- Service relies on the stability of the external website's HTML structure

# Deployment Strategy

## Application Structure
- **Entry Point**: `main.py` imports the Flask app
- **Configuration**: Environment-based secret key with development fallback
- **Static Assets**: Served directly by Flask for simplicity

## Key Considerations
- Application depends on external website availability
- HTML parsing is brittle and may break if BCH site structure changes
- Timeout handling (30 seconds) for external requests
- CORS enabled for web application integration

## Monitoring Needs
- External service availability monitoring
- HTML structure change detection
- Error rate monitoring for parsing failures
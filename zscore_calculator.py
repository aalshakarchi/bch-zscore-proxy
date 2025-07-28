import requests
from bs4 import BeautifulSoup

def calculate_zscore(form_data):
    """
    Posts form_data to the BCH Z-Score Calculator AJAX endpoint (root '/')
    and parses the returned HTML to extract Z-score results.
    
    Args:
        form_data: dict of form field names → values, mirroring the form submission payload.
    
    Returns:
        dict with keys: ZScore, Percentile, 5th, 50th, 95th.
    
    Raises:
        requests.exceptions.RequestException: For network-related errors
        ValueError: For parsing errors or unexpected response format
    """
    url = "https://zscore.chboston.org/"
    
    try:
        resp = requests.post(url, data=form_data, timeout=30)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise requests.exceptions.RequestException(f"Failed to connect to BCH calculator: {str(e)}")

    # Parse returned HTML fragment
    try:
        soup = BeautifulSoup(resp.text, 'html.parser')
        table = soup.find('table', class_='table-zscore')
        
        if not table:
            raise ValueError("Z-score results table not found in response")
        
        rows = table.find_all('tr')
        if len(rows) < 2:
            raise ValueError("Expected table format not found - insufficient rows")
        
        # Extract values from the second row of the table
        second_row = rows[1]
        cells = [td.get_text(strip=True) for td in second_row.find_all('td')]
        
        if len(cells) < 5:
            raise ValueError(f"Expected 5 result values, got {len(cells)}")
        
        zscore, percentile, p5, p50, p95 = cells[:5]

        return {
            'ZScore': zscore,
            'Percentile': percentile,
            '5th': p5,
            '50th': p50,
            '95th': p95
        }
        
    except Exception as e:
        if isinstance(e, ValueError):
            raise
        raise ValueError(f"Failed to parse BCH calculator response: {str(e)}")

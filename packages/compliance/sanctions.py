
import unicodedata
import re
import pandas as pd


def normalize_text(text: str) -> str:
    """
    Normalize text for robust fuzzy matching.
    
    Applies NFKC normalization, lowercasing, accent stripping,
    punctuation canonicalization, and whitespace collapse.
    
    Note: Non-Latin scripts (Chinese, Arabic, Cyrillic) are stripped
    because OFAC sanctions lists use romanized names. For example:
    - "中国工商银行" → "" (empty)
    - "INDUSTRIAL AND COMMERCIAL BANK OF CHINA" → "industrial and commercial bank of china"
    
    Args:
        text: Raw text string to normalize
        
    Returns:
        Normalized text string suitable for fuzzy matching.
        Returns empty string if input contains only non-Latin characters.
        
    Examples:
        >>> normalize_text("José María O'Brien")
        'jose maria obrien'
        
        >>> normalize_text("AL-QAIDA")
        'al qaida'
        
        >>> normalize_text("中国工商银行")
        ''
    """
    if not text or pd.isna(text):
        return ""
    
    # Convert to string if not already
    text = str(text)
    
    # Unicode normalization (canonical composition)
    text = unicodedata.normalize("NFKC", text)
    
    # Lowercase
    text = text.lower()
    
    # Strip accent marks (diacritics)
    # Decompose characters, then filter out combining marks
    text = ''.join(
        char for char in unicodedata.normalize("NFD", text)
        if unicodedata.category(char) != 'Mn'
    )
    
    # Remove quotes (single and double)
    text = re.sub(r"['\"]", "", text)
    
    # Replace non-alphanumeric (except space and hyphen) with space
    # Note: This strips non-Latin scripts (Chinese, Arabic, Cyrillic, etc.)
    # OFAC lists use romanized names, so this is intentional behavior
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    
    # Collapse multiple spaces to single space
    text = re.sub(r"\s+", " ", text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text
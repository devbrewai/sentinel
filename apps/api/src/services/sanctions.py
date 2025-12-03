import pickle
import os
from apps.api.src.config import settings
from packages.compliance.sanctions_api import SanctionsScreener, SanctionsQuery, SanctionsResponse

class SanctionsService:
    def __init__(self):
        self.screener: SanctionsScreener | None = None
        self.screener_path = settings.SCREENER_PATH

    def load_screener(self):
        """Load the pre-trained sanctions screener pickle."""
        if not os.path.exists(self.screener_path):
            raise FileNotFoundError(f"Screener file not found at: {self.screener_path}")
            
        with open(self.screener_path, 'rb') as f:
            self.screener = pickle.load(f)
        print(f"Loaded Sanctions Screener from {self.screener_path}")

    def screen_name(self, name: str, country: str = None) -> SanctionsResponse:
        """
        Screen a name against the loaded sanctions list.
        """
        if not self.screener:
            self.load_screener()

        query = SanctionsQuery(name=name, country=country)
        return self.screener.screen(query)

# Global instance
sanctions_service = SanctionsService()

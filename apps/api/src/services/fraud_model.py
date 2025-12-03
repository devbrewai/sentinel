import lightgbm as lgb
import numpy as np
from apps.api.src.config import settings
import os

class FraudModelService:
    def __init__(self):
        self.model = None
        self.model_path = settings.MODEL_PATH

    def load_model(self):
        """Load LightGBM model from disk."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")
        
        # Load model using LightGBM
        self.model = lgb.Booster(model_file=self.model_path)
        print(f"Loaded Fraud Model from {self.model_path}")

    def predict(self, features: list[float]) -> float:
        """
        Run inference on a feature vector.
        
        Args:
            features: List of float features in the exact order of training
            
        Returns:
            Probability of fraud (0.0 to 1.0)
        """
        if not self.model:
            self.load_model()
            
        # Reshape for single prediction (1, N_features)
        # lightgbm expects a 2D array
        input_data = np.array(features).reshape(1, -1)
        
        # Run prediction
        prob = self.model.predict(input_data)[0]
        return float(prob)

# Global instance
fraud_model_service = FraudModelService()

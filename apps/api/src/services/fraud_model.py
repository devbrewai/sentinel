import lightgbm as lgb
import pandas as pd
from apps.api.src.config import settings
from apps.api.src.schemas.feature_factory import load_feature_registry
import os

class FraudModelService:
    def __init__(self):
        self.model = None
        self.model_path = settings.MODEL_PATH
        self.feature_columns = []
        self.categorical_features = []

    def load_model(self):
        """Load LightGBM model from disk and feature registry."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")
        
        # Load model using LightGBM
        self.model = lgb.Booster(model_file=self.model_path)
        print(f"Loaded Fraud Model from {self.model_path}")

        # Load registry info to know column order and types
        registry = load_feature_registry()
        self.feature_columns = registry.get("feature_columns", [])
        self.categorical_features = registry.get("categorical_features", [])

    def predict(self, features: dict) -> float:
        """
        Run inference on a feature dictionary.
        
        Args:
            features: Dictionary of feature_name -> value
            
        Returns:
            Probability of fraud (0.0 to 1.0)
        """
        if not self.model:
            self.load_model()
            
        # Create DataFrame from the single dictionary
        df = pd.DataFrame([features])
        
        # 1. Ensure all expected columns exist and are in the correct order
        # This adds NaNs for missing features and drops extra request fields
        df = df.reindex(columns=self.feature_columns)
        
        # 2. Cast numeric features to float
        # This ensures None becomes NaN (float) instead of object, which LightGBM requires
        # for all non-categorical columns
        numeric_cols = [c for c in self.feature_columns if c not in self.categorical_features]
        df[numeric_cols] = df[numeric_cols].astype(float)

        # 3. Cast categorical features to 'category' dtype
        # LightGBM requires this to handle string values like "W", "visa", etc.
        for col in self.categorical_features:
            if col in df.columns:
                df[col] = df[col].astype('category')
        
        # Run prediction
        prob = self.model.predict(df)[0]
        return float(prob)

# Global instance
fraud_model_service = FraudModelService()

import lightgbm as lgb
import pandas as pd
import pickle
import os
from typing import List, Dict, Any, Tuple
from ..config import settings
from ..schemas.feature_factory import load_feature_registry


class FraudModelService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.model_path = settings.MODEL_PATH
        self.explainer_path = settings.EXPLAINER_PATH
        self.feature_columns = []
        self.categorical_features = []

    def load_model(self):
        """Load LightGBM model and SHAP explainer from disk."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")

        # Load model using LightGBM
        self.model = lgb.Booster(model_file=self.model_path)
        print(f"Loaded Fraud Model from {self.model_path}")

        # Load registry info to know column order and types
        registry = load_feature_registry()
        self.feature_columns = registry.get("feature_columns", [])
        self.categorical_features = registry.get("categorical_features", [])

        # Load SHAP explainer
        if os.path.exists(self.explainer_path):
            with open(self.explainer_path, 'rb') as f:
                self.explainer = pickle.load(f)
            print(f"Loaded SHAP Explainer from {self.explainer_path}")
        else:
            print(f"Warning: SHAP explainer not found at {self.explainer_path}")

    def _prepare_features(self, features: dict) -> pd.DataFrame:
        """Prepare feature DataFrame from input dictionary."""
        # Create DataFrame from the single dictionary
        df = pd.DataFrame([features])

        # 1. Ensure all expected columns exist and are in the correct order
        df = df.reindex(columns=self.feature_columns)

        # 2. Cast numeric features to float
        numeric_cols = [c for c in self.feature_columns if c not in self.categorical_features]
        df[numeric_cols] = df[numeric_cols].astype(float)

        # 3. Cast categorical features to 'category' dtype
        for col in self.categorical_features:
            if col in df.columns:
                df[col] = df[col].astype('category')

        return df

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

        df = self._prepare_features(features)
        prob = self.model.predict(df)[0]
        return float(prob)

    def predict_with_explanation(
        self, features: dict, top_n: int = 5
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Run inference and return SHAP-based feature importance.

        Args:
            features: Dictionary of feature_name -> value
            top_n: Number of top contributing features to return

        Returns:
            Tuple of (risk_score, top_features)
            top_features is a list of dicts with keys: name, value, contribution
        """
        if not self.model:
            self.load_model()

        df = self._prepare_features(features)

        # Get prediction
        prob = float(self.model.predict(df)[0])

        # Get SHAP explanation if explainer is available
        top_features = []
        if self.explainer is not None:
            try:
                # Compute SHAP values for this instance
                shap_values = self.explainer.shap_values(df)

                # shap_values is a 2D array [1, num_features]
                values = shap_values[0] if len(shap_values.shape) == 2 else shap_values

                # Get feature names
                feature_names = self.feature_columns

                # Create list of (name, shap_value, feature_value) tuples
                feature_contributions = []
                for i, name in enumerate(feature_names):
                    shap_val = float(values[i])
                    feat_val = df.iloc[0][name]
                    # Convert to Python native type
                    if pd.isna(feat_val):
                        feat_val = None
                    elif hasattr(feat_val, 'item'):
                        feat_val = feat_val.item()
                    feature_contributions.append((name, shap_val, feat_val))

                # Sort by absolute SHAP value (most impactful first)
                feature_contributions.sort(key=lambda x: abs(x[1]), reverse=True)

                # Take top N
                for name, shap_val, feat_val in feature_contributions[:top_n]:
                    top_features.append({
                        "name": name,
                        "value": feat_val,
                        "contribution": round(shap_val, 4),
                    })

            except Exception as e:
                print(f"Warning: SHAP explanation failed: {e}")

        return prob, top_features


# Global instance
fraud_model_service = FraudModelService()

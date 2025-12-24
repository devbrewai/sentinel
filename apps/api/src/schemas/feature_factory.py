import json
import os
from typing import Type, Dict, Any, Optional
from pydantic import create_model, Field, BaseModel
from ..config import settings

def load_feature_registry() -> Dict[str, Any]:
    """Load the feature registry JSON."""
    registry_path = settings.FEATURE_REGISTRY_PATH
    
    if not os.path.exists(registry_path):
        raise FileNotFoundError(f"Feature registry not found at {registry_path}")
        
    with open(registry_path, 'r') as f:
        return json.load(f)

def create_feature_schema() -> Type[BaseModel]:
    """
    Dynamically create a Pydantic model based on the feature registry.
    This ensures the API strictly accepts exactly what the model was trained on.
    """
    registry = load_feature_registry()
    
    fields = {}
    
    # Add numeric features (float, optional)
    for feature in registry.get("numeric_features", []):
        # Use Optional[float] because model handles NaNs
        fields[feature] = (Optional[float], Field(default=None, description=f"Numeric feature: {feature}"))
        
    # Add categorical features (str, optional)
    for feature in registry.get("categorical_features", []):
        fields[feature] = (Optional[str], Field(default=None, description=f"Categorical feature: {feature}"))

    # Create the dynamic model
    FeatureModel = create_model("ModelFeatures", **fields)
    return FeatureModel

# Create the class once at module level
ModelFeatures = create_feature_schema()

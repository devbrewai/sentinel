import redis.asyncio as redis
from apps.api.src.config import settings

class FeatureService:
    def __init__(self):
        self.redis: redis.Redis | None = None

    async def connect(self):
        """Initialize Redis connection pool."""
        self.redis = redis.from_url(
            str(settings.REDIS_URL), 
            encoding="utf-8", 
            decode_responses=True
        )

    async def close(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()

    async def get_velocity_features(self, card_id: str) -> dict:
        """
        Get and increment velocity counters for a card.
        Real-world logic:
        1. Increment counter for 1h and 24h windows.
        2. Return current values.
        """
        if not self.redis:
            await self.connect()

        # Keys for this card
        key_1h = f"vel:{card_id}:1h"
        key_24h = f"vel:{card_id}:24h"

        # Pipeline for atomic execution (optional but good practice)
        pipe = self.redis.pipeline()
        
        # Increment 1h counter
        pipe.incr(key_1h)
        pipe.expire(key_1h, 3600) # 1 hour TTL
        
        # Increment 24h counter
        pipe.incr(key_24h)
        pipe.expire(key_24h, 86400) # 24 hours TTL
        
        results = await pipe.execute()
        
        # Results order matches pipeline commands: [incr_1h, expire_1h, incr_24h, expire_24h]
        count_1h = results[0]
        count_24h = results[2]

        return {
            "velocity_1h": count_1h,
            "velocity_24h": count_24h
        }

# Global instance
feature_service = FeatureService()

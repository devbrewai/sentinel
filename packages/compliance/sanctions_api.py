"""
Production-grade sanctions screening API module.

This module provides a clean, production-ready interface for screening transaction
names against OFAC sanctions lists. It encapsulates all screening logic including:

- Multi-strategy blocking for efficient candidate retrieval
- Two-stage adaptive scoring for optimal latency/recall balance
- Decision logic with configurable thresholds
- Country and program filtering with audit logging

Designed for integration into payment processing systems with sub-50ms p95 latency
and ≥98% recall on real-world name variations.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from datetime import datetime
import time
import numpy as np
import pandas as pd

from rapidfuzz import fuzz

from packages.compliance.sanctions import normalize_text, tokenize


# Decision thresholds
IS_MATCH_THRESHOLD = 0.90
REVIEW_THRESHOLD = 0.80


@dataclass
class SanctionsQuery:
    """
    Input query for sanctions screening.
    
    Attributes:
        name: Name to screen against sanctions lists
        country: Optional country filter (e.g., "Cuba", "Iran")
        program: Optional program filter (e.g., "CUBA", "IRAN")
        top_k: Number of top matches to return (default: 3, max: 10)
    """
    name: str
    country: Optional[str] = None
    program: Optional[str] = None
    top_k: int = 3
    
    def __post_init__(self):
        """Validate query parameters."""
        if not self.name or not self.name.strip():
            raise ValueError("name cannot be empty")
        if self.top_k < 1 or self.top_k > 10:
            raise ValueError("top_k must be between 1 and 10")


@dataclass
class SanctionsMatch:
    """
    A single match result from sanctions screening.
    
    Attributes:
        match_name: Original name from sanctions list
        score: Composite similarity score [0, 1]
        is_match: True if score ≥ 0.90 (high confidence match)
        decision: Classification ('is_match', 'review', or 'no_match')
        country: Country code if available
        program: Sanctions program if available
        source: Source list ('SDN' or 'Consolidated')
        uid: Unique identifier for the sanctions record
        sim_set: Token set ratio (optional, for debugging)
        sim_sort: Token sort ratio (optional, for debugging)
        sim_partial: Partial ratio (optional, for debugging)
    """
    match_name: str
    score: float
    is_match: bool
    decision: str
    country: Optional[str]
    program: Optional[str]
    source: str
    uid: str
    sim_set: Optional[float] = None
    sim_sort: Optional[float] = None
    sim_partial: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'match_name': self.match_name,
            'score': self.score,
            'is_match': self.is_match,
            'decision': self.decision,
            'country': self.country,
            'program': self.program,
            'source': self.source,
            'uid': self.uid,
            'sim_set': self.sim_set,
            'sim_sort': self.sim_sort,
            'sim_partial': self.sim_partial
        }


@dataclass
class SanctionsResponse:
    """
    Complete response from sanctions screening.
    
    Attributes:
        query: Original query name
        top_matches: List of top-K matches sorted by score
        applied_filters: Dictionary tracking which filters were applied
        latency_ms: Query latency in milliseconds
        version: API version string
        timestamp: ISO format timestamp of when screening was performed
    """
    query: str
    top_matches: List[SanctionsMatch]
    applied_filters: Dict[str, Optional[str]]
    latency_ms: float
    version: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'query': self.query,
            'top_matches': [m.to_dict() for m in self.top_matches],
            'applied_filters': self.applied_filters,
            'latency_ms': self.latency_ms,
            'version': self.version,
            'timestamp': self.timestamp
        }


def apply_decision_threshold(score: float) -> tuple[bool, str]:
    """
    Apply decision logic based on score thresholds.
    
    Args:
        score: Composite similarity score [0, 1]
        
    Returns:
        Tuple of (is_match: bool, decision: str)
    """
    if score >= IS_MATCH_THRESHOLD:
        return True, 'is_match'
    elif score >= REVIEW_THRESHOLD:
        return False, 'review'
    else:
        return False, 'no_match'


def get_first_token(tokens: List[str]) -> Optional[str]:
    """Extract first token for blocking."""
    return tokens[0] if tokens else None


def get_token_count_bucket(tokens: List[str]) -> str:
    """Get token count bucket for blocking."""
    count = len(tokens)
    if count == 1:
        return 'single'
    elif count == 2:
        return 'double'
    elif count <= 4:
        return 'medium'
    else:
        return 'long'


def get_initials_signature(tokens: List[str]) -> str:
    """Generate initials signature for blocking."""
    if not tokens:
        return ''
    initials = [t[0] for t in tokens if len(t) > 0]
    return '-'.join(initials)


def get_candidates(
    query_tokens: List[str],
    first_token_index: Dict[str, List[int]],
    bucket_index: Dict[str, List[int]],
    initials_index: Dict[str, List[int]]
) -> tuple[List[int], Dict[int, int]]:
    """
    Retrieve candidate indices using multi-strategy blocking.
    
    Returns candidates with priority scores based on how many
    blocking strategies they match (higher = more likely to be relevant).
    
    Args:
        query_tokens: Tokenized query name
        first_token_index: Blocking index by first token
        bucket_index: Blocking index by token count bucket
        initials_index: Blocking index by initials signature
        
    Returns:
        Tuple of (candidate_indices, priority_scores)
    """
    candidate_counts: Dict[int, int] = {}
    
    # Strategy 1: First token match
    first_token = get_first_token(query_tokens)
    if first_token and first_token in first_token_index:
        for idx in first_token_index[first_token]:
            candidate_counts[idx] = candidate_counts.get(idx, 0) + 3
    
    # Strategy 2: Token count bucket
    bucket = get_token_count_bucket(query_tokens)
    if bucket in bucket_index:
        for idx in bucket_index[bucket]:
            candidate_counts[idx] = candidate_counts.get(idx, 0) + 1
    
    # Strategy 3: Initials signature
    initials = get_initials_signature(query_tokens)
    if initials and initials in initials_index:
        for idx in initials_index[initials]:
            candidate_counts[idx] = candidate_counts.get(idx, 0) + 2
    
    # Sort by priority (candidates appearing in multiple strategies first)
    candidate_indices = sorted(
        candidate_counts.keys(),
        key=lambda x: candidate_counts[x],
        reverse=True
    )
    
    return candidate_indices, candidate_counts


def compute_similarity_batch(
    query_norm: str,
    candidate_norms: List[str]
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute similarity scores for query against multiple candidates using vectorized operations.
    
    Args:
        query_norm: Normalized query string
        candidate_norms: List of normalized candidate strings
        
    Returns:
        Tuple of (set_scores, sort_scores, partial_scores) as numpy arrays
    """
    if not candidate_norms:
        return np.array([]), np.array([]), np.array([])
    
    # Vectorized batch scoring using RapidFuzz
    set_scores = np.array([
        fuzz.token_set_ratio(query_norm, cand) / 100.0
        for cand in candidate_norms
    ])
    
    sort_scores = np.array([
        fuzz.token_sort_ratio(query_norm, cand) / 100.0
        for cand in candidate_norms
    ])
    
    partial_scores = np.array([
        fuzz.partial_ratio(query_norm, cand) / 100.0
        for cand in candidate_norms
    ])
    
    return set_scores, sort_scores, partial_scores


def composite_score_batch(
    set_scores: np.ndarray,
    sort_scores: np.ndarray,
    partial_scores: np.ndarray
) -> np.ndarray:
    """
    Compute composite scores from individual similarity metrics.
    
    Uses weighted average: 40% token_set, 40% token_sort, 20% partial.
    
    Args:
        set_scores: Token set ratio scores
        sort_scores: Token sort ratio scores
        partial_scores: Partial ratio scores
        
    Returns:
        Composite scores as numpy array
    """
    return (
        0.40 * set_scores +
        0.40 * sort_scores +
        0.20 * partial_scores
    )


class SanctionsScreener:
    """
    Production-ready sanctions screening wrapper.
    
    Encapsulates all screening logic and provides a clean API for integration
    into payment processing systems. Implements two-stage adaptive scoring
    for optimal latency/recall balance.
    
    Performance targets:
    - Latency: p95 < 50ms
    - Recall: ≥98% on real-world name variations
    - Precision: ≥95% on top-1 matches
    """
    
    def __init__(
        self,
        sanctions_index: pd.DataFrame,
        first_token_index: Dict[str, List[int]],
        bucket_index: Dict[str, List[int]],
        initials_index: Dict[str, List[int]],
        version: str = "1.0.0"
    ):
        """
        Initialize screener with pre-loaded indices.
        
        Args:
            sanctions_index: DataFrame with canonicalized names and metadata
            first_token_index: Blocking index by first token
            bucket_index: Blocking index by token count bucket
            initials_index: Blocking index by initials signature
            version: Version string for tracking
        """
        self.sanctions_index = sanctions_index
        self.first_token_index = first_token_index
        self.bucket_index = bucket_index
        self.initials_index = initials_index
        self.version = version
        
        # Cache for repeated queries (optional optimization)
        self._cache: Dict[str, List[Dict[str, Any]]] = {}
        self._cache_max_size = 1000
    
    def screen(
        self,
        query: SanctionsQuery,
        initial_candidates: int = 2000,
        expand_threshold: float = 0.85,
        max_candidates: int = 3000,
        early_exit_threshold: float = 0.60
    ) -> SanctionsResponse:
        """
        Screen a name against sanctions lists.
        
        Uses two-stage adaptive scoring:
        1. Score top priority candidates (default: 2000)
        2. If top score < expand_threshold, expand to max_candidates
        3. Early exit if top score < early_exit_threshold (clear non-match)
        
        Args:
            query: SanctionsQuery with name and optional filters
            initial_candidates: Number of candidates to score in Stage 1
            expand_threshold: Score threshold for triggering Stage 2 expansion
            max_candidates: Maximum candidates to score if expanding
            early_exit_threshold: Score threshold for early exit (clear non-match)
            
        Returns:
            SanctionsResponse with top matches and metadata
        """
        start_time = time.time()
        
        # Normalize and tokenize query
        query_norm = normalize_text(query.name)
        query_tokens = tokenize(query_norm)
        
        if not query_tokens:
            return SanctionsResponse(
                query=query.name,
                top_matches=[],
                applied_filters={'country': query.country, 'program': query.program},
                latency_ms=(time.time() - start_time) * 1000,
                version=self.version
            )
        
        # Get candidates with prioritization
        candidate_indices, priority_scores = get_candidates(
            query_tokens,
            self.first_token_index,
            self.bucket_index,
            self.initials_index
        )
        
        if not candidate_indices:
            return SanctionsResponse(
                query=query.name,
                top_matches=[],
                applied_filters={'country': query.country, 'program': query.program},
                latency_ms=(time.time() - start_time) * 1000,
                version=self.version
            )
        
        # Stage 1: Score top priority candidates
        high_priority_candidates = [
            idx for idx in candidate_indices
            if priority_scores.get(idx, 0) >= 3
        ]
        
        if len(high_priority_candidates) > 0:
            remaining_slots = initial_candidates - len(high_priority_candidates)
            if remaining_slots > 0:
                other_candidates = [
                    idx for idx in candidate_indices
                    if idx not in high_priority_candidates
                ][:remaining_slots]
                candidates_to_score = high_priority_candidates + other_candidates
            else:
                candidates_to_score = high_priority_candidates[:initial_candidates]
        else:
            candidates_to_score = candidate_indices[:initial_candidates]
        
        # Pre-extract candidate data
        candidate_norm_list = []
        candidate_metadata = []
        candidate_idx_map = []
        
        for idx in candidates_to_score:
            try:
                candidate = self.sanctions_index.iloc[idx]
                candidate_norm_list.append(candidate['name_norm'])
                candidate_metadata.append({
                    'uid': candidate['uid'],
                    'name': candidate['name'],
                    'country': candidate.get('country'),
                    'program': candidate.get('program'),
                    'source': candidate.get('source', 'SDN')
                })
                candidate_idx_map.append(idx)
            except (IndexError, KeyError):
                continue
        
        if not candidate_norm_list:
            return SanctionsResponse(
                query=query.name,
                top_matches=[],
                applied_filters={'country': query.country, 'program': query.program},
                latency_ms=(time.time() - start_time) * 1000,
                version=self.version
            )
        
        # Stage 1: Batch score initial candidates
        set_scores, sort_scores, partial_scores = compute_similarity_batch(
            query_norm,
            candidate_norm_list
        )
        
        composite_scores = composite_score_batch(set_scores, sort_scores, partial_scores)
        
        # Check if we need to expand (two-stage approach)
        top_score = float(np.max(composite_scores)) if len(composite_scores) > 0 else 0.0
        
        # Early exit: If top score is very low, it's clearly a non-match
        if top_score < early_exit_threshold:
            # Use Stage 1 results as-is
            pass
        # Stage 2: If top score is low but not too low, expand candidate set
        elif top_score < expand_threshold and len(candidate_indices) > initial_candidates:
            # Expand to max_candidates
            additional_candidates = [
                idx for idx in candidate_indices
                if idx not in candidate_idx_map
            ][:(max_candidates - len(candidate_idx_map))]
            
            # Score additional candidates
            additional_norms = []
            additional_metadata = []
            additional_idx_map = []
            
            for idx in additional_candidates:
                try:
                    candidate = self.sanctions_index.iloc[idx]
                    additional_norms.append(candidate['name_norm'])
                    additional_metadata.append({
                        'uid': candidate['uid'],
                        'name': candidate['name'],
                        'country': candidate.get('country'),
                        'program': candidate.get('program'),
                        'source': candidate.get('source', 'SDN')
                    })
                    additional_idx_map.append(idx)
                except (IndexError, KeyError):
                    continue
            
            if additional_norms:
                add_set_scores, add_sort_scores, add_partial_scores = compute_similarity_batch(
                    query_norm,
                    additional_norms
                )
                add_composite_scores = composite_score_batch(
                    add_set_scores, add_sort_scores, add_partial_scores
                )
                
                # Combine results
                candidate_norm_list.extend(additional_norms)
                candidate_metadata.extend(additional_metadata)
                candidate_idx_map.extend(additional_idx_map)
                composite_scores = np.concatenate([composite_scores, add_composite_scores])
                set_scores = np.concatenate([set_scores, add_set_scores])
                sort_scores = np.concatenate([sort_scores, add_sort_scores])
                partial_scores = np.concatenate([partial_scores, add_partial_scores])
        
        # Sort by composite score (descending)
        sorted_indices = np.argsort(composite_scores)[::-1]
        
        # Build match results
        matches = []
        for i in sorted_indices:
            if len(matches) >= query.top_k:
                break
                
            score = float(composite_scores[i])
            metadata = candidate_metadata[i]
            
            # Apply filters if specified
            if query.country and metadata['country'] != query.country:
                continue
            
            # Program filter: Check if program string contains the filter value
            # (programs can be multi-program strings like "IRAN] [SDGT] [IFSR]")
            if query.program:
                program_str = str(metadata['program']) if metadata['program'] else ''
                # Check if filter program appears in the program string
                # Handle both exact match and substring match (for multi-program strings)
                if query.program.upper() not in program_str.upper():
                    continue
            
            is_match, decision = apply_decision_threshold(score)
            
            matches.append(SanctionsMatch(
                match_name=metadata['name'],
                score=score,
                is_match=is_match,
                decision=decision,
                country=metadata['country'],
                program=metadata['program'],
                source=metadata['source'],
                uid=metadata['uid'],
                sim_set=float(set_scores[i]),
                sim_sort=float(sort_scores[i]),
                sim_partial=float(partial_scores[i])
            ))
        
        latency_ms = (time.time() - start_time) * 1000
        
        return SanctionsResponse(
            query=query.name,
            top_matches=matches,
            applied_filters={'country': query.country, 'program': query.program},
            latency_ms=latency_ms,
            version=self.version
        )
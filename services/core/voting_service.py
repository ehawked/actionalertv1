from typing import List, Optional
from uuid import UUID
from core.vote import Vote
from core.feedback import Feedback
from solar.access import authenticated, User

@authenticated
def toggle_vote(user: User, feedback_id: UUID) -> dict:
    """Toggle a vote on feedback. Returns the new vote status and count."""
    
    # Check if user has already voted on this feedback
    existing_vote = Vote.sql(
        "SELECT * FROM votes WHERE user_id = %(user_id)s AND feedback_id = %(feedback_id)s",
        {"user_id": str(user.id), "feedback_id": str(feedback_id)}
    )
    
    if existing_vote:
        # Remove the vote
        Vote.sql(
            "DELETE FROM votes WHERE user_id = %(user_id)s AND feedback_id = %(feedback_id)s",
            {"user_id": str(user.id), "feedback_id": str(feedback_id)}
        )
        voted = False
    else:
        # Add the vote
        vote = Vote(
            user_id=user.id,
            feedback_id=feedback_id
        )
        vote.sync()
        voted = True
    
    # Get updated vote count
    vote_count_result = Vote.sql(
        "SELECT COUNT(*) as count FROM votes WHERE feedback_id = %(feedback_id)s",
        {"feedback_id": str(feedback_id)}
    )
    vote_count = vote_count_result[0]['count'] if vote_count_result else 0
    
    # Update the cached vote count in feedback table
    Feedback.sql(
        "UPDATE feedback SET vote_count = %(vote_count)s WHERE id = %(feedback_id)s",
        {"vote_count": vote_count, "feedback_id": str(feedback_id)}
    )
    
    return {
        "voted": voted,
        "vote_count": vote_count
    }

@authenticated
def check_user_vote(user: User, feedback_id: UUID) -> bool:
    """Check if user has voted on specific feedback."""
    existing_vote = Vote.sql(
        "SELECT id FROM votes WHERE user_id = %(user_id)s AND feedback_id = %(feedback_id)s",
        {"user_id": str(user.id), "feedback_id": str(feedback_id)}
    )
    return len(existing_vote) > 0

@authenticated
def get_user_votes(user: User, feedback_ids: List[UUID]) -> dict:
    """Get user's vote status for multiple feedback items."""
    if not feedback_ids:
        return {}
    
    # Convert UUIDs to strings for SQL query
    feedback_id_strings = [str(fid) for fid in feedback_ids]
    placeholders = ', '.join(['%s'] * len(feedback_id_strings))
    
    query = f"""
        SELECT feedback_id 
        FROM votes 
        WHERE user_id = %(user_id)s 
        AND feedback_id IN ({placeholders})
    """
    
    # Create parameters dict
    params = {"user_id": str(user.id)}
    for i, fid in enumerate(feedback_id_strings):
        params[f"feedback_id_{i}"] = fid
    
    # Rebuild query with proper parameter names
    param_names = [f"%(feedback_id_{i})s" for i in range(len(feedback_id_strings))]
    query = f"""
        SELECT feedback_id 
        FROM votes 
        WHERE user_id = %(user_id)s 
        AND feedback_id IN ({', '.join(param_names)})
    """
    
    voted_feedback = Vote.sql(query, params)
    
    # Convert to a dict mapping feedback_id -> True for voted items
    result = {}
    for feedback_id in feedback_ids:
        result[str(feedback_id)] = False
    
    for vote in voted_feedback:
        result[vote['feedback_id']] = True
    
    return result

@authenticated
def get_vote_count(feedback_id: UUID) -> int:
    """Get the total vote count for a specific feedback."""
    result = Vote.sql(
        "SELECT COUNT(*) as count FROM votes WHERE feedback_id = %(feedback_id)s",
        {"feedback_id": str(feedback_id)}
    )
    return result[0]['count'] if result else 0
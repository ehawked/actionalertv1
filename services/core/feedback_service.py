from typing import List, Optional
from uuid import UUID
from core.feedback import Feedback
from core.vote import Vote
from solar.access import authenticated, public, User

@authenticated
def submit_feedback(
    user: User,
    legislative_item_id: UUID,
    content: str
) -> Feedback:
    """Submit feedback on a legislative item."""
    # Validate content length
    if len(content) > 1000:
        raise ValueError("Feedback content must be 1000 characters or less")
    
    if not content.strip():
        raise ValueError("Feedback content cannot be empty")
    
    feedback = Feedback(
        content=content.strip(),
        user_id=user.id,
        legislative_item_id=legislative_item_id,
        status="approved"
    )
    feedback.sync()
    return feedback

@public
def get_feedback_for_item(
    legislative_item_id: UUID,
    sort_by: str = "newest"
) -> List[dict]:
    """Get all approved feedback for a legislative item with vote counts and user emails."""
    # Base query that gets feedback with user email and vote count
    base_query = """
        SELECT 
            f.*,
            u.email as user_email,
            COALESCE(v.vote_count, 0) as actual_vote_count
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN (
            SELECT feedback_id, COUNT(*) as vote_count
            FROM votes
            GROUP BY feedback_id
        ) v ON f.id = v.feedback_id
        WHERE f.legislative_item_id = %(item_id)s 
        AND f.status = 'approved'
    """
    
    # Add sorting
    if sort_by == "most_votes":
        order_clause = "ORDER BY actual_vote_count DESC, f.created_at DESC"
    elif sort_by == "oldest":
        order_clause = "ORDER BY f.created_at ASC"
    else:  # newest (default)
        order_clause = "ORDER BY f.created_at DESC"
    
    query = base_query + order_clause
    
    results = Feedback.sql(query, {"item_id": str(legislative_item_id)})
    
    # Format results to include user email and actual vote count
    formatted_results = []
    for result in results:
        feedback_dict = {
            'id': result['id'],
            'content': result['content'],
            'user_id': result['user_id'],
            'legislative_item_id': result['legislative_item_id'],
            'status': result['status'],
            'created_at': result['created_at'],
            'updated_at': result['updated_at'],
            'vote_count': result['actual_vote_count'],
            'user_email': result['user_email']
        }
        formatted_results.append(feedback_dict)
    
    return formatted_results

@authenticated
def get_user_feedback(user: User) -> List[dict]:
    """Get all feedback submitted by the current user with vote counts."""
    results = Feedback.sql("""
        SELECT 
            f.*,
            li.title as legislative_title,
            COALESCE(v.vote_count, 0) as actual_vote_count
        FROM feedback f
        LEFT JOIN legislative_items li ON f.legislative_item_id = li.id
        LEFT JOIN (
            SELECT feedback_id, COUNT(*) as vote_count
            FROM votes
            GROUP BY feedback_id
        ) v ON f.id = v.feedback_id
        WHERE f.user_id = %(user_id)s
        AND f.status != 'deleted'
        ORDER BY f.created_at DESC
    """, {"user_id": str(user.id)})
    
    # Format results
    formatted_results = []
    for result in results:
        feedback_dict = {
            'id': result['id'],
            'content': result['content'],
            'user_id': result['user_id'],
            'legislative_item_id': result['legislative_item_id'],
            'status': result['status'],
            'created_at': result['created_at'],
            'updated_at': result['updated_at'],
            'vote_count': result['actual_vote_count'],
            'legislative_title': result['legislative_title']
        }
        formatted_results.append(feedback_dict)
    
    return formatted_results

@authenticated
def moderate_feedback(
    user: User,
    feedback_id: UUID,
    action: str
) -> bool:
    """Moderate feedback (admin only). Actions: 'approve', 'hide', 'delete'."""
    if action not in ['approve', 'hide', 'delete']:
        raise ValueError("Invalid action. Must be 'approve', 'hide', or 'delete'")
    
    # Update feedback status
    results = Feedback.sql(
        "UPDATE feedback SET status = %(status)s WHERE id = %(feedback_id)s",
        {"status": action + "d" if action != "delete" else "deleted", "feedback_id": str(feedback_id)}
    )
    
    return True

@authenticated
def get_all_feedback_for_moderation(user: User) -> List[dict]:
    """Get all feedback for moderation purposes (admin only)."""
    results = Feedback.sql("""
        SELECT 
            f.*,
            u.email as user_email,
            li.title as legislative_title,
            COALESCE(v.vote_count, 0) as actual_vote_count
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN legislative_items li ON f.legislative_item_id = li.id
        LEFT JOIN (
            SELECT feedback_id, COUNT(*) as vote_count
            FROM votes
            GROUP BY feedback_id
        ) v ON f.id = v.feedback_id
        ORDER BY f.created_at DESC
    """)
    
    # Format results
    formatted_results = []
    for result in results:
        feedback_dict = {
            'id': result['id'],
            'content': result['content'],
            'user_id': result['user_id'],
            'legislative_item_id': result['legislative_item_id'],
            'status': result['status'],
            'created_at': result['created_at'],
            'updated_at': result['updated_at'],
            'vote_count': result['actual_vote_count'],
            'user_email': result['user_email'],
            'legislative_title': result['legislative_title']
        }
        formatted_results.append(feedback_dict)
    
    return formatted_results
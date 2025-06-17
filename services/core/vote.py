from solar import Table, ColumnDetails
from datetime import datetime
import uuid

class Vote(Table):
    __tablename__ = "votes"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID  # Reference to the user who voted
    feedback_id: uuid.UUID  # Reference to the feedback being voted on
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    
    # Note: In a real app, we'd want a unique constraint on (user_id, feedback_id)
    # to prevent duplicate votes, but Solar doesn't support explicit constraints
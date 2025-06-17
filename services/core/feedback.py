from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class Feedback(Table):
    __tablename__ = "feedback"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    content: str  # The feedback text (max 1000 chars enforced in business logic)
    user_id: uuid.UUID  # Reference to the user who submitted the feedback
    legislative_item_id: uuid.UUID  # Reference to the legislative item
    status: str = "approved"  # "approved", "hidden", "deleted", "pending"
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
    vote_count: int = 0  # Cached vote count for performance
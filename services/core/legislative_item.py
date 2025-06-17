from solar import Table, ColumnDetails
from typing import Optional
from datetime import datetime
import uuid

class LegislativeItem(Table):
    __tablename__ = "legislative_items"
    
    id: uuid.UUID = ColumnDetails(default_factory=uuid.uuid4, primary_key=True)
    title: str
    summary: str
    author: str
    status: str  # e.g., "proposed", "in_committee", "passed", "failed"
    full_description: str
    bill_number: Optional[str] = None  # e.g., "HB 123", "SB 456"
    category: Optional[str] = None  # e.g., "education", "healthcare", "environment"
    created_at: datetime = ColumnDetails(default_factory=datetime.now)
    updated_at: datetime = ColumnDetails(default_factory=datetime.now)
    is_active: bool = True  # Whether this item is currently accepting feedback
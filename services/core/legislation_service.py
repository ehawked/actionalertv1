from typing import List, Optional
from uuid import UUID
from core.legislative_item import LegislativeItem
from solar.access import public, authenticated, User

@public
def get_legislative_items() -> List[LegislativeItem]:
    """Get all active legislative items."""
    results = LegislativeItem.sql(
        "SELECT * FROM legislative_items WHERE is_active = true ORDER BY created_at DESC"
    )
    return [LegislativeItem(**result) for result in results]

@public
def get_legislative_item(item_id: UUID) -> Optional[LegislativeItem]:
    """Get a specific legislative item by ID."""
    results = LegislativeItem.sql(
        "SELECT * FROM legislative_items WHERE id = %(item_id)s",
        {"item_id": str(item_id)}
    )
    if results:
        return LegislativeItem(**results[0])
    return None

@authenticated
def create_legislative_item(
    user: User,
    title: str,
    summary: str,
    author: str,
    status: str,
    full_description: str,
    bill_number: Optional[str] = None,
    category: Optional[str] = None
) -> LegislativeItem:
    """Create a new legislative item. Admin only function."""
    item = LegislativeItem(
        title=title,
        summary=summary,
        author=author,
        status=status,
        full_description=full_description,
        bill_number=bill_number,
        category=category
    )
    item.sync()
    return item

@authenticated
def update_legislative_item(
    user: User,
    item_id: UUID,
    title: Optional[str] = None,
    summary: Optional[str] = None,
    author: Optional[str] = None,
    status: Optional[str] = None,
    full_description: Optional[str] = None,
    bill_number: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Optional[LegislativeItem]:
    """Update a legislative item. Admin only function."""
    results = LegislativeItem.sql(
        "SELECT * FROM legislative_items WHERE id = %(item_id)s",
        {"item_id": str(item_id)}
    )
    
    if not results:
        return None
    
    item_data = results[0]
    
    # Update only provided fields
    if title is not None:
        item_data['title'] = title
    if summary is not None:
        item_data['summary'] = summary
    if author is not None:
        item_data['author'] = author
    if status is not None:
        item_data['status'] = status
    if full_description is not None:
        item_data['full_description'] = full_description
    if bill_number is not None:
        item_data['bill_number'] = bill_number
    if category is not None:
        item_data['category'] = category
    if is_active is not None:
        item_data['is_active'] = is_active
    
    item = LegislativeItem(**item_data)
    item.sync()
    return item

@public
def get_legislative_items_by_category(category: str) -> List[LegislativeItem]:
    """Get all active legislative items in a specific category."""
    results = LegislativeItem.sql(
        "SELECT * FROM legislative_items WHERE category = %(category)s AND is_active = true ORDER BY created_at DESC",
        {"category": category}
    )
    return [LegislativeItem(**result) for result in results]
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from services.db_service import db_service

class AnalyticsService:
    def __init__(self):
        # Allowable event types to prevent garbage data injection
        self.valid_events = {
            'page_view',
            'session_start',
            'search_query',
            'fund_view',
            'map_click',
            'sector_click',
            'compare_funds'
        }

    def create_session(self, anonymous_id: str, locale: str, device_type: str, referrer: Optional[str] = None) -> Optional[str]:
        """
        Create a new analytics session.
        Returns the generated session_id as a string, or None if insertion fails.
        """
        try:
            # Validate anonymous_id is a valid UUID to prevent injection attacks
            val = uuid.UUID(anonymous_id)
            
            data = {
                "anonymous_id": str(val),
                "locale": locale[:10] if locale else "unknown",
                "device_type": device_type[:20] if device_type else "unknown",
                "referrer": referrer[:500] if referrer else None
            }
            
            response = db_service.supabase.table('analytics_sessions').insert(data).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get('id')
            return None
            
        except ValueError:
            # Invalid UUID format for anonymous_id
            print(f"Invalid anonymous_id format: {anonymous_id}")
            return None
        except Exception as e:
            print(f"Analytics session creation error: {e}")
            return None

    def track_event(self, session_id: str, event_type: str, event_data: Dict[str, Any]) -> bool:
        """
        Log an event for a given session.
        Returns True on success, False otherwise.
        """
        if event_type not in self.valid_events:
            print(f"Invalid event type: {event_type}")
            return False
            
        try:
            # Validate session_id is a valid UUID
            val = uuid.UUID(session_id)
            
            data = {
                "session_id": str(val),
                "event_type": event_type,
                "event_data": event_data
            }
            
            response = db_service.supabase.table('analytics_events').insert(data).execute()
            
            return bool(response.data and len(response.data) > 0)
        
        except ValueError:
            print(f"Invalid session_id format: {session_id}")
            return False
        except Exception as e:
            print(f"Analytics event tracking error: {e}")
            return False

# Initialize a singleton instance
analytics_service = AnalyticsService()

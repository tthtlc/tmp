import os
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from decouple import config

AUDIT_LOG_DIR = config('AUDIT_LOG_DIR', default='../audit-logs')

def ensure_audit_dir():
    """Ensure audit log directory exists"""
    os.makedirs(AUDIT_LOG_DIR, exist_ok=True)

def get_audit_filename():
    """Get audit log filename for current date"""
    today = datetime.now().strftime('%Y-%m-%d')
    return os.path.join(AUDIT_LOG_DIR, f'audit_{today}.log')

def log_question_change(
    question_id: int,
    user_id: int,
    username: str,
    action: str,
    old_data: Optional[Dict[str, Any]] = None,
    new_data: Optional[Dict[str, Any]] = None,
    summary: Optional[str] = None
):
    """Log question changes to sequential audit file"""
    ensure_audit_dir()
    
    # Create audit entry
    audit_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'question_id': question_id,
        'user_id': user_id,
        'username': username,
        'action': action,
        'summary': summary or f"Question {action.lower()}"
    }
    
    # Add diff information if both old and new data provided
    if old_data and new_data:
        changes = {}
        for key in new_data:
            if key in old_data and old_data[key] != new_data[key]:
                changes[key] = {
                    'old': old_data[key],
                    'new': new_data[key]
                }
        audit_entry['changes'] = changes
    elif new_data:
        audit_entry['data'] = new_data
    
    # Write to audit log file
    audit_filename = get_audit_filename()
    with open(audit_filename, 'a', encoding='utf-8') as f:
        f.write(json.dumps(audit_entry, ensure_ascii=False) + '\n')

def get_question_audit_history(question_id: int, days_back: int = 30) -> list:
    """Get audit history for a specific question"""
    history = []
    
    # Check audit files for the specified number of days
    for i in range(days_back):
        date = datetime.now() - timedelta(days=i)
        filename = os.path.join(AUDIT_LOG_DIR, f'audit_{date.strftime("%Y-%m-%d")}.log')
        
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        if entry.get('question_id') == question_id:
                            history.append(entry)
                    except json.JSONDecodeError:
                        continue
    
    # Sort by timestamp (newest first)
    history.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return history
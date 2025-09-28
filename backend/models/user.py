from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Since models are defined in app.py, this file can be removed or used for model utilities
# For now, we'll keep it as a reference but not define any models here
# The actual User model is defined in app.py to avoid circular import issues
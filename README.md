# Netflij
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

# To create user:
python manage.py shell
```python
from django.contrib.auth.models import Permission, User
User(username=..., password=...).save()
```

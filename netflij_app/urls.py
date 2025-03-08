from django.urls import path

from . import views

urlpatterns = [
    path("", views.index),
    path("login", views.login_page),
    path("admin", views.admin),
    path("edit", views.edit),
    path("remove", views.remove),
    path("next", views.next),
    path("add", views.add),
]

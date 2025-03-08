import os
import shutil
import random
import subprocess
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from netflij_app.models import Show, ALLOWED_TYPES, _handle_logo_file


def require_permission(permission):
    def wrapper(func):
        def inner(request):
            if request.user.has_perm(permission):
                return func(request)
            else:
                return HttpResponse(status=403)

        return inner

    return wrapper


def login_page(request):
    if request.method == "POST":
        username = request.POST.get("username", None)
        password = request.POST.get("password", None)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        return redirect("/")
    return render(request, "login.html")


@login_required(login_url="/login")
def index(request):
    return render(request, "index.html", context={"seed": random.randint(0, 1000)})


@require_permission("netflij_app.can_publish")
def admin(request):
    return render(request, "admin.html", context={"shows": Show.objects.all()})


@require_permission("netflij_app.can_publish")
def edit(request):
    try:
        uid = request.GET.get("uid", None)
        show = Show.objects.get(uid=uid)
        return render(request, "edit.html", context=dict(show=show))
    except Exception as e:
        return redirect("/admin")


@login_required(login_url="/login")
def next(request):
    """
    Using next allows changing existing shows or adding new ones without refreshing
    alreaedy opened pages
    """
    seed = int(request.GET.get("seed", random.randint(0, 1000)))
    shows = list(
        Show.objects.filter(approved=True)
    )  # Convert to list to allow random.shuffle
    current_index = int(request.GET.get("currentIndex", 0)) % len(shows)
    random.Random(seed).shuffle(shows)
    return JsonResponse(
        {
            "status": True,
            "total": len(shows),
            "uid": shows[current_index].uid,
            "name": shows[current_index].name,
            "description": shows[current_index].description,
            "genres": shows[current_index].genres,
            "announcement": shows[current_index].announcement,
        }
    )


def _create_show(
    name, description, genres, announcement, logo_handle, background_handle, approved
):
    show = Show(
        name=name,
        description=description,
        genres=genres,
        announcement=announcement,
        approved=approved,
    )
    show_directory = os.path.join("netflij_app", "static", "shows", str(show.uid))
    os.makedirs(show_directory, exist_ok=True)
    logo_path = os.path.join(show_directory, "logo")

    with open(logo_path, "wb") as logo_file:
        for chunk in logo_handle.chunks():
            logo_file.write(chunk)
    try:
        _handle_logo_file(logo_path)
    except:
        shutil.rmtree(show_directory)
        raise

    with open(os.path.join(show_directory, "background"), "wb") as background_file:
        for chunk in background_handle.chunks():
            background_file.write(chunk)
    show.save()


@require_permission("netflij_app.can_publish")
def add(request):
    try:
        title = request.POST.get("title", "")
        genres = request.POST.get("genres", "")
        approved = request.POST.get("approved", False) == "on"
        announcement = request.POST.get("announcement", "")
        description = request.POST.get("description", "")
        uid = request.POST.get("uid", None)
        logo = request.FILES["logo"]
        background = request.FILES["background"]
        if uid is not None:
            # If show available (this is an edit), remove it before re-adding it
            Show(uid=uid).delete()
        _create_show(
            title, description, genres, announcement, logo, background, approved
        )
        return JsonResponse({"status": True})
    except Exception as e:
        return JsonResponse({"status": False, "message": str(e)})


@require_permission("netflij_app.can_publish")
def remove(request):
    try:
        uid = request.POST.get("uid", None)
        show = Show.objects.get(uid=uid)
        show.delete()
        return JsonResponse({"status": True})
    except Exception as e:
        return JsonResponse({"status": False, "message": str(e)})

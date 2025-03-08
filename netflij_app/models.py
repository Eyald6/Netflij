import os
import uuid
import json
import shutil
import subprocess
from django.db import models

# Create your models here.

ALLOWED_TYPES = ["png", "jpeg", "jpg", "svg"]


def _handle_logo_file(path):
    ftype = subprocess.check_output(["file", "-b", path]).decode().split()[0].lower()
    # Just to be safe
    if ftype in ALLOWED_TYPES:
        if ftype == "svg":
            os.rename(path, f"{path}.svg")
    else:
        raise Exception("File type not allowed")


class Show(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=2000)
    genres = models.CharField(max_length=2000, default="")
    announcement = models.CharField(max_length=2000, default="")
    approved = models.BooleanField(default=True)

    @classmethod
    def add_show(
        cls, name, description, logo_data, background_data, genres="", announcement=""
    ):
        show = Show(
            name=name, description=description, genres=genres, announcement=announcement
        )
        show_directory = os.path.join("netflij_app", "static", "shows", str(show.uid))
        os.makedirs(show_directory, exist_ok=True)
        logo_path = os.path.join(show_directory, "logo")
        with open(logo_path, "wb") as logo_file:
            logo_file.write(logo_data)
        _handle_logo_file(logo_path)
        with open(os.path.join(show_directory, "background"), "wb") as background_file:
            background_file.write(background_data)
        show.save()
        return show

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "genres": self.genres,
            "announcement": self.announcement,
            "uid": self.uid,
        }

    def delete(self):
        show_directory = os.path.join("netflij_app", "static", "shows", str(self.uid))
        try:
            shutil.rmtree(show_directory)
        except Exception as e:
            print(e)
        super().delete()

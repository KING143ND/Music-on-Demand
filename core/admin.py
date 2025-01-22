from django.contrib import admin
from . models import MusicDirector, Singer, Album, Track, Playlist, Profile

# Register your models here.
admin.site.register(MusicDirector)
admin.site.register(Singer)
admin.site.register(Album)
admin.site.register(Track)
admin.site.register(Playlist)
admin.site.register(Profile)
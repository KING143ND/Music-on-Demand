from django.contrib import admin
from . models import MusicDirector, Singer, Album, Track, Playlist

# Register your models here.
admin.site.register(MusicDirector)
admin.site.register(Singer)
admin.site.register(Album)
admin.site.register(Track)
admin.site.register(Playlist)
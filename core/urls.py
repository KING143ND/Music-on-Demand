from django.urls import path
from core.views import home, album_details, singer_details, music_director_details, toggle_favorite

urlpatterns = [
    path('', home, name='home'),
    path('album/<slug:slug>/', album_details, name='album_details'),
    path('singer/<slug:slug>/', singer_details, name='singer_details'),
    path('music-director/<slug:slug>/', music_director_details, name='music_director_details'),
    path('toggle-favorite/<int:track_id>/', toggle_favorite, name='toggle_favorite'),
]




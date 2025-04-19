from django.urls import path
from core.views import home, album_details, singer_details, music_director_details, toggle_favorite, get_song_details, play_song

urlpatterns = [
    path(
        '', 
        home, 
        name='home'
    ),
    path(
        'album/<slug:slug>/', 
        album_details, 
        name='album_details'
    ),
    path(
        'singer/<slug:slug>/', 
        singer_details, 
        name='singer_details'
    ),
    path(
        'music-director/<slug:slug>/', 
        music_director_details, 
        name='music_director_details'
    ),
    path(
        'toggle-favorite/<int:track_id>/', 
        toggle_favorite, 
        name='toggle_favorite'
    ),
    path(
        'api/get-song-details/<int:track_id>/', 
        get_song_details, 
        name='get_song_details'
    ),
    path(
        'play_song/', 
        play_song, 
        name='play_song'
    ),
]




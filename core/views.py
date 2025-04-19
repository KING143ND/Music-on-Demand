import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.models import MusicDirector, Album, Track, Playlist, Singer, Profile
from authentication.forms import LoginForm, RegisterForm, CustomPasswordChangeForm


def home(request):
    albums = Album.objects.all()[:6]
    songs = Track.objects.all()[:12]
    artists = MusicDirector.objects.all()[:12]
    singers = Singer.objects.all()[:12]
    context = {
        'albums':albums,
        'songs':songs,
        'artists':artists,
        'singers':singers, 
        'login_form': LoginForm(), 
        'register_form': RegisterForm(), 
        'password_change_form': CustomPasswordChangeForm(request.user)
    }
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'songs': list(songs.values('id', 'title', 'audio_file', 'album__title', 'album__image'))
        })
    if request.headers.get('Hx-Request') == 'true':
        return render(request, 'index.html', context)
    return render(request, "base.html", {**context, 'partial': 'index.html'})


def album_details(request, slug):
    album = Album.objects.get(slug=slug)
    songs = Track.objects.filter(album=album)
    all_singers = set(artist.name for song in songs for artist in song.artist.all().distinct())
    context = {
        'album': album,
        'songs': songs,
        'all_singers': all_singers
    }
    if request.headers.get('Hx-Request') == 'true':
        return render(request, 'album_songs.html', context)
    return render(request, 'base.html', {**context, 'partial': 'album_songs.html'})
    
    
def singer_details(request, slug):
    singer = Singer.objects.get(slug=slug)
    print(singer)
    songs = Track.objects.filter(artist=singer)
    print(songs)
    albums = songs.values_list('album', flat=True).distinct()
    return render(request, 'singer_albums.html', {
        'singer': singer,
        'songs': songs,
        'albums': albums
    })
    
    
def music_director_details(request, slug):
    artist = MusicDirector.objects.get(slug=slug)
    albums = Album.objects.filter(artist=artist)
    songs = Track.objects.filter(album__in=albums)
    return render(request, 'artist_albums.html', {
        'artist': artist,
        'albums': albums,
        'songs': songs
    })
    

@csrf_exempt    
def toggle_favorite(request, track_id):
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        track = get_object_or_404(Track, id=track_id)
        print(profile)
        print(track)
        if track in profile.favorites.all():
            profile.favorites.remove(track)
            is_favorite = False
        else:
            profile.favorites.add(track)
            is_favorite = True
        return JsonResponse({'is_favorite': is_favorite, 'track_id': track_id})
    else:
        return JsonResponse({'message': 'User is not authenticated'}, status=401)


def get_song_details(request, track_id):
    try:
        song = Track.objects.get(id=track_id)
        data = {
            "title": song.title,
            "artistNames": ", ".join(artist.name for artist in song.artist.all()),
            "albumName": song.album.title,
            "imageUrl": song.album.image.url if song.album.image else "/path/to/default-image.jpg",
            "url": song.audio_file.url,
        }
        return JsonResponse(data, safe=False)
    except Track.DoesNotExist:
        return JsonResponse({"error": "Song not found"}, status=404)
    
    
@csrf_exempt
def play_song(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        song_id = data.get('song_id')
        song = Track.objects.get(id=song_id)

        response_data = {
            'success': True,
            'song_title': song.title,
            'artist': ', '.join([artist.name for artist in song.artist.all()]),
            'album_title': song.album.title,
            'album_art': song.album.image.url,
            'audio_file_url': song.audio_file.url
        }
        return JsonResponse(response_data)
    return JsonResponse({'success': False}, status=400)

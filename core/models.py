from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
      

class MusicDirector(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    image = models.ImageField(upload_to='music_directors/', blank=True, null=True)
    biography = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(MusicDirector, self).save(*args, **kwargs)
    
    
class Singer(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    image = models.ImageField(upload_to='singers/', blank=True, null=True)
    biography = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Singer, self).save(*args, **kwargs)


class Album(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    artist = models.ManyToManyField(MusicDirector, related_name='music_directors')
    image = models.ImageField(upload_to='albums/', blank=True, null=True)
    release_year = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Album, self).save(*args, **kwargs)


class Track(models.Model):
    title = models.CharField(max_length=255)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='tracks_album')
    artist = models.ManyToManyField(Singer, related_name='track_singers')
    audio_file = models.FileField(upload_to='songs/audio/', blank=True, null=True)
    category = models.CharField(max_length=50, default="")

    def __str__(self):
        return self.title


class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    tracks = models.ManyToManyField(Track, blank=True)

    def __str__(self):
        return f"{self.user.username}'s playlist: {self.name}"

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Playlist, self).save(*args, **kwargs)
        
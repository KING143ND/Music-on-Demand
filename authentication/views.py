from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from authentication.forms import RegisterForm, LoginForm, CustomPasswordChangeForm


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Registration successful! You are now logged in, Welcome {user.username}.')
            return redirect('home')
        else:
            for field in form:
                if field.errors:
                    for error in field.errors:
                        messages.error(request, f"Registration failed. {error}")
    else:
        form = RegisterForm()
    return redirect('home')


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.username}!')
                return redirect('home')
            else:
                messages.error(request, 'Invalid username or password.')
                return redirect('home')
        else:
            messages.error(request, 'Login failed. Please try again.')
            return redirect('home')
    else:
        form = LoginForm()
        return redirect('home')


def logout_view(request):
    logout(request)
    messages.info(request, 'You have successfully logged out.')
    return redirect('login')


class CustomPasswordChangeView(PasswordChangeView):
    form_class = CustomPasswordChangeForm
    template_name = 'change_password.html'
    success_url = reverse_lazy('profile')

    def form_valid(self, form):
        messages.success(self.request, "Your password was changed successfully.")
        return super().form_valid(form)
    
    def form_invalid(self, form):
        custom_field_names = {
            'old_password': 'Old Password',
            'new_password1': 'New Password',
            'new_password2': 'Confirm New Password',
        }
        error_messages = []
        for field, errors in form.errors.items():
            custom_field_name = custom_field_names.get(field, field)
            error_messages.append(f"{custom_field_name}: {' '.join(errors)}")
        messages.error(self.request, " ".join(error_messages))
        return super().form_invalid(form)
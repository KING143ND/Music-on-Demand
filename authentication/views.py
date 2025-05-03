from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from core.models import Profile
from authentication.forms import RegisterForm, LoginForm, CustomPasswordChangeForm


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user.email and Profile.objects.filter(email=user.email).exists():
                messages.error(request, "Email has been already taken!😔")
                return redirect('home')
            profile_name = form.cleaned_data.get('profile_name')
            name_parts = str(profile_name).strip().split()
            first_name = name_parts[0]
            last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
            user.first_name = first_name
            user.last_name = last_name
            user.username = profile_name
            user.save()
            Profile.objects.create(
                user=user,
                email=user.email,
                first_name=first_name,
                last_name=last_name
            )
            login(request, user)
            messages.success(request, f'Registration successful! You are now logged in, Welcome {user.username}.')
            return redirect('home')
        else:
            request.session['show_register_modal'] = True
            for field in form:
                if field.errors:
                    for error in field.errors:
                        messages.error(request, f"Registration failed. {error}")
            response = render(request, 'base.html', {'register_form': form})
            request.session.pop('show_register_modal', None)

            return response
    return redirect('home')


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        print(form)
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
    return redirect('home')


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
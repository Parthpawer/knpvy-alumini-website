"""
URL configuration for alumni_portal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('about/history/', views.about, name = 'history'),
    path('about/executive_body/', views.executive_body, name = 'executive-body'),
    path('events/', views.events, name='events'),
    path('awards/', views.awards, name = 'awards'),
    path('activity/', views.activity, name = 'activity'),
    path('placement/', views.placement, name = 'placement'),
    path('scholarship/', views.scholarship, name = 'scholarship'),
    path('assistanceship/', views.assistanceship, name = 'assistanceship'),
    path('clinical-guidance/', views.clinical_guidance, name='clinical-guidance'),
    path('research/', views.research, name='research'),
    path('farmers-corner/', views.farmers_corner, name='farmers_corner'),
]

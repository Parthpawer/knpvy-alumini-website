from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'app/home.html')

def about(request):
    return render(request, 'app/about.html')

def executive_body(request):
    return render(request, 'app/executive_body.html')

def events(request):
    return render(request, 'app/events.html')

def awards(request):
    return render(request, 'app/awards.html')

def activity(request):
    return render(request, 'app/activity.html')

def placement(request):
    return render(request, 'app/placement.html')

def scholarship(request):
    return render(request, 'app/scholarship.html')

def assistanceship(request):
    return render(request, 'app/assistanceship.html')

def clinical_guidance(request):
    return render(request, 'app/clinical_guidance.html')

def research(request):
    return render(request, 'app/research.html')

def farmers_corner(request):
    return render(request, 'app/farmers_corner.html')
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
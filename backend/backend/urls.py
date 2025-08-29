from django.contrib import admin
from django.urls import path, include 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

# Import the views from simplejwt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # This endpoint will be used to get a new access token once it expires
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve React app for all other routes (fallback for client-side routing)
if not settings.DEBUG:
    urlpatterns += [
        path('', TemplateView.as_view(template_name='index.html')),
        path('<path:path>', TemplateView.as_view(template_name='index.html')),
    ]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


import os
import dj_database_url
from dotenv import load_dotenv


from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-development-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# Fix ALLOWED_HOSTS - only hostnames, not full URLs
ALLOWED_HOSTS = [
    "localhost", 
    "127.0.0.1",   # Remove https://
    "fluxtrader.xyz",
    "fluxtrader.xyz/api/"  # Add your frontend domain
]
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Get database URL from environment
database_url = os.environ.get('DATABASE_URL')

# Debug: Print the raw DATABASE_URL (remove in production)
if database_url:
    print(f"Raw DATABASE_URL: {database_url}")
    # Mask password for security
    masked_url = database_url.replace(database_url.split('@')[0].split(':')[-1], '***') if '@' in database_url else database_url
    print(f"Masked DATABASE_URL: {masked_url}")

# Configure database with SSL disabled for containerized environments
if database_url:
    try:
        # First, try to parse the URL manually to debug
        from urllib.parse import urlparse
        parsed_url = urlparse(database_url)
        print(f"Parsed URL components:")
        print(f"  Scheme: {parsed_url.scheme}")
        print(f"  Username: {parsed_url.username}")
        print(f"  Password: {'***' if parsed_url.password else 'None'}")
        print(f"  Hostname: {parsed_url.hostname}")
        print(f"  Port: {parsed_url.port}")
        print(f"  Path: {parsed_url.path}")
        
        # Try dj_database_url first, with fallback to manual parsing
        try:
            db_config = dj_database_url.config(
                default=database_url,
                conn_max_age=600,
                ssl_require=False,
                ssl_mode='disable',
                # Force SSL to be disabled
                ssl_cert=None,
                ssl_key=None,
                ssl_ca=None,
                # Additional options to ensure SSL is disabled
                options={
                    'sslmode': 'disable',
                }
            )
            
            # Verify the configuration has the expected keys
            required_keys = ['ENGINE', 'NAME', 'USER', 'PASSWORD', 'HOST', 'PORT']
            if all(key in db_config for key in required_keys):
                DATABASES = {'default': db_config}
                print("Using dj_database_url configuration")
            else:
                raise ValueError("Missing required database configuration keys")
                
        except Exception as dj_error:
            print(f"dj_database_url failed: {dj_error}")
            print("Falling back to manual URL parsing")
            
            # Manual fallback parsing
            if parsed_url.scheme == 'postgresql' or parsed_url.scheme == 'postgres':
                DATABASES = {
                    'default': {
                        'ENGINE': 'django.db.backends.postgresql',
                        'NAME': parsed_url.path[1:] if parsed_url.path else 'postgres',
                        'USER': parsed_url.username or 'postgres',
                        'PASSWORD': parsed_url.password or '',
                        'HOST': parsed_url.hostname or 'localhost',
                        'PORT': parsed_url.port or '5432',
                        'OPTIONS': {
                            'sslmode': 'disable',
                        },
                        'CONN_MAX_AGE': 600,
                    }
                }
                print("Using manual PostgreSQL configuration")
            else:
                raise ValueError(f"Unsupported database scheme: {parsed_url.scheme}")
        
        # Debug: Print final database configuration (remove in production)
        print(f"Final database configuration:")
        for key, value in DATABASES['default'].items():
            if key == 'PASSWORD':
                print(f"  {key}: ***")
            else:
                print(f"  {key}: {value}")
        
    except Exception as e:
        print(f"Error configuring database: {e}")
        print(f"Falling back to SQLite")
        # Fallback to SQLite if there's an error
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    print("No DATABASE_URL found, using SQLite fallback")
    # Fallback for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }



# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    # This line sets the default authentication method for all protected views.
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# JWT Token Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # 1 hour instead of default 5 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(hours=1),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=7),
}

# Fix CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://fluxtrader.xyz",  # Your frontend domain
]

# Add CORS_ALLOW_CREDENTIALS for authentication
CORS_ALLOW_CREDENTIALS = True

# Add CORS_ALLOWED_HEADERS for JWT tokens
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

FRONTEND_URL = os.environ.get('FRONTEND_URL')
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# Email Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
if not RESEND_API_KEY:
    raise ValueError("RESEND_API_KEY environment variable is required for email functionality")
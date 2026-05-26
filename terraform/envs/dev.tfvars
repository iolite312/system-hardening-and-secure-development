environment = "dev"

image = "system-hardening-and-secure-development:v1"

# Database config
postgres_password        = "secret123"
postgres_db              = "comics"
postgres_user            = "developer"
jwt_access_secret        = "dev-access-secret-do-not-use-in-prod-aaaaaaaaaaaaaaaaaaaaa"
jwt_refresh_secret       = "dev-refresh-secret-do-not-use-in-prod-bbbbbbbbbbbbbbbbbbbb"
jwt_access_ttl           = 900
jwt_refresh_ttl          = 604800
seed_superadmin_email    = "admin@example.com"
seed_superadmin_password = "ChangeMe!SuperAdmin123"
seed_superadmin_name     = "Super Admin"

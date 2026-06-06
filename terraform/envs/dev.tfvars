environment = "dev"

image = "system-hardening-and-secure-development:v1"

# Vault — run `kubectl port-forward -n vault svc/vault 8200:8200` before applying,
# or set vault_address to "http://$(minikube ip):30820" to use the NodePort directly.
vault_address = "http://127.0.0.1:8200"
vault_token   = "root"

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

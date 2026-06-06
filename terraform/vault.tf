# Mount a fresh KV v2 engine (avoids conflict with dev-mode's pre-mounted secret/ path)
resource "vault_mount" "kv" {
  path        = "kv"
  type        = "kv-v2"
  description = "KV v2 secrets engine for ${var.app_name}"
}

# Write all app secrets into Vault — this is the single source of truth
resource "vault_kv_secret_v2" "app" {
  mount = vault_mount.kv.path
  name  = var.app_name

  data_json = jsonencode({
    postgres_password        = var.postgres_password
    postgres_user            = var.postgres_user
    postgres_db              = var.postgres_db
    jwt_access_secret        = var.jwt_access_secret
    jwt_refresh_secret       = var.jwt_refresh_secret
    jwt_access_ttl           = tostring(var.jwt_access_ttl)
    jwt_refresh_ttl          = tostring(var.jwt_refresh_ttl)
    seed_superadmin_email    = var.seed_superadmin_email
    seed_superadmin_password = var.seed_superadmin_password
    seed_superadmin_name     = var.seed_superadmin_name
  })
}

# Enable the Kubernetes auth method so pods can authenticate to Vault with their ServiceAccount token
resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}

resource "vault_kubernetes_auth_backend_config" "main" {
  backend                = vault_auth_backend.kubernetes.path
  kubernetes_host        = "https://kubernetes.default.svc"
  disable_iss_validation = true
}

# Policy: pods may only read their own secret path
resource "vault_policy" "app" {
  name = var.app_name

  policy = <<-EOT
    path "kv/data/${var.app_name}" {
      capabilities = ["read"]
    }
  EOT
}

# Kubernetes auth role bound to the app's ServiceAccount so pods can authenticate
resource "vault_kubernetes_auth_backend_role" "app" {
  backend                          = vault_auth_backend.kubernetes.path
  role_name                        = var.app_name
  bound_service_account_names      = [var.app_name]
  bound_service_account_namespaces = [kubernetes_namespace.app.metadata[0].name]
  token_policies                   = [vault_policy.app.name]
  token_ttl                        = 3600
}

# Read the secrets back from Vault so Terraform can bridge them into a Kubernetes Secret
data "vault_kv_secret_v2" "app" {
  mount = vault_mount.kv.path
  name  = vault_kv_secret_v2.app.name
}

# Kubernetes Secret populated from Vault — pods reference this instead of raw variable values
resource "kubernetes_secret" "app" {
  metadata {
    name      = "${var.app_name}-secrets"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  data = {
    POSTGRES_PASSWORD = data.vault_kv_secret_v2.app.data["postgres_password"]
    POSTGRES_USER     = data.vault_kv_secret_v2.app.data["postgres_user"]
    POSTGRES_DB       = data.vault_kv_secret_v2.app.data["postgres_db"]

    # Pre-assembled so the app container never sees individual credentials
    DATABASE_URL = "postgres://${data.vault_kv_secret_v2.app.data["postgres_user"]}:${data.vault_kv_secret_v2.app.data["postgres_password"]}@postgres:5432/${data.vault_kv_secret_v2.app.data["postgres_db"]}"

    JWT_ACCESS_SECRET        = data.vault_kv_secret_v2.app.data["jwt_access_secret"]
    JWT_REFRESH_SECRET       = data.vault_kv_secret_v2.app.data["jwt_refresh_secret"]
    JWT_ACCESS_TTL           = data.vault_kv_secret_v2.app.data["jwt_access_ttl"]
    JWT_REFRESH_TTL          = data.vault_kv_secret_v2.app.data["jwt_refresh_ttl"]
    SEED_SUPERADMIN_EMAIL    = data.vault_kv_secret_v2.app.data["seed_superadmin_email"]
    SEED_SUPERADMIN_PASSWORD = data.vault_kv_secret_v2.app.data["seed_superadmin_password"]
    SEED_SUPERADMIN_NAME     = data.vault_kv_secret_v2.app.data["seed_superadmin_name"]
  }

  type = "Opaque"
}

resource "helm_release" "vault" {
  name       = "vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  namespace  = "vault"
  create_namespace = true

  set {
    name  = "server.ha.enabled"
    value = "true"
  }

  set {
    name  = "server.ha.raft.enabled"
    value = "true"
  }
}


resource "vault_mount" "kv" {
  path = "secret"
  type = "kv-v2"
}

#kubernetes auth backend

resource "vault_auth_backend" "kubernetes" {
  type = "kubernetes"
}


resource "vault_kubernetes_auth_backend_config" "k8s" {
  backend         = vault_auth_backend.kubernetes.path
  kubernetes_host = "https://kubernetes.default.svc"

  token_reviewer_jwt = var.token_reviewer_jwt
}


#vault secrets (changes this in future maybe)
resource "vault_kv_secret_v2" "postgres" {
  mount = "secret"
  name  = "postgres"

  data_json = jsonencode({
    username = var.postgres_user
    password = var.postgres_password
    database = var.postgres_db
  })
}

resource "vault_kv_secret_v2" "auth" {
  mount = "secret"
  name  = "auth"

  data_json = jsonencode({
    jwt_access_secret  = var.jwt_access_secret
    jwt_refresh_secret = var.jwt_refresh_secret
    jwt_access_ttl     = var.jwt_access_ttl
    jwt_refresh_ttl    = var.jwt_refresh_ttl
  })
}

resource "vault_kv_secret_v2" "seed_admin" {
  mount = "secret"
  name  = "seed-admin"

  data_json = jsonencode({
    email    = var.seed_superadmin_email
    password = var.seed_superadmin_password
    name     = var.seed_superadmin_name
  })
}


#vault policies
resource "vault_policy" "app" {
  name = "comic-library-policy"

  policy = <<EOT
path "secret/data/postgres" {
  capabilities = ["read"]
}

path "secret/data/auth" {
  capabilities = ["read"]
}

path "secret/data/seed-admin" {
  capabilities = ["read"]
}
EOT
}

#kubernetes auth role
resource "vault_kubernetes_auth_backend_role" "app" {
  backend = vault_auth_backend.kubernetes.path
  role_name = "${var.app_name}-role"

  bound_service_account_names = ["comic-library-sa"]
  bound_service_account_namespaces = ["default"]

  policies = [vault_policy.app.name]

  ttl = 3600
}



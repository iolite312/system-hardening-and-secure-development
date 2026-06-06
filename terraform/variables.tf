variable "environment" {
  description = "Environment name"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "comic-library"
}

variable "image" {
  description = "Docker image"
  type        = string
}

variable "replicas" {
  description = "Number of replicas"
  type        = number
  default     = 1
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 80
}

variable "service_type" {
  description = "Kubernetes service type"
  type        = string
  default     = "NodePort"
}

# Vault connection — Terraform uses these to write secrets into Vault and configure auth
variable "vault_address" {
  description = "Vault server address reachable from the host running Terraform"
  type        = string
  default     = "http://127.0.0.1:8200"
}

variable "vault_token" {
  description = "Vault token used to bootstrap secrets (dev-mode root token is 'root')"
  type        = string
  sensitive   = true
  default     = "root"
}

# Secret values — Terraform writes these into Vault; pods never receive them directly
variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "postgres_db" {
  type    = string
  default = "comicdb"
}

variable "postgres_user" {
  type    = string
  default = "comic"
}

variable "jwt_access_secret" {
  type      = string
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  sensitive = true
}

variable "jwt_access_ttl" {
  type      = number
  sensitive = true
}

variable "jwt_refresh_ttl" {
  type      = number
  sensitive = true
}

variable "seed_superadmin_email" {
  type      = string
  sensitive = true
}

variable "seed_superadmin_password" {
  type      = string
  sensitive = true
}

variable "seed_superadmin_name" {
  type      = string
  sensitive = true
}

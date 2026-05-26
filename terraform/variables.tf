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

# variable "database_url" {
#   type      = string
#   sensitive = true
# }

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

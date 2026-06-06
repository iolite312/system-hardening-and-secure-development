resource "kubernetes_namespace" "app" {
  metadata {
    name = var.environment
  }
}

# ServiceAccount lets the app pod authenticate to Vault using the Kubernetes auth method
resource "kubernetes_service_account" "app" {
  metadata {
    name      = var.app_name
    namespace = kubernetes_namespace.app.metadata[0].name
  }
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {

        security_context {
          run_as_non_root = true
          fs_group        = 999
        }

        container {
          name              = "postgres"
          image             = "postgres:17.10-alpine"
          image_pull_policy = "Always"

          port {
            container_port = 5432
          }

          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          security_context {
            allow_privilege_escalation = false
            read_only_root_filesystem  = false

            capabilities {
              drop = ["NET_RAW"]
            }
          }

          # $(POSTGRES_USER) is expanded by sh at runtime from the env var set above
          readiness_probe {
            exec {
              command = ["sh", "-c", "pg_isready -p 5432"]
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }

          liveness_probe {
            exec {
              command = ["sh", "-c", "pg_isready -p 5432"]
            }

            initial_delay_seconds = 30
            period_seconds        = 20
          }

          volume_mount {
            mount_path = "/var/lib/postgresql/data"
            name       = "postgres-storage"
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }
  }
}

resource "kubernetes_deployment" "fullstack" {
  metadata {
    name      = "fullstack"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "fullstack"
      }
    }

    template {
      metadata {
        labels = {
          app = "fullstack"
        }
      }

      spec {
        service_account_name = kubernetes_service_account.app.metadata[0].name

        security_context {
          run_as_non_root = true
        }

        container {
          name  = "fullstack"
          image = var.image
          image_pull_policy = "Always"

          port {
            container_port = 3000
          }

          env {
            name = "NUXT_DATABASE_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "DATABASE_URL"
              }
            }
          }

          env {
            name = "NUXT_JWT_ACCESS_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "JWT_ACCESS_SECRET"
              }
            }
          }

          env {
            name = "NUXT_JWT_REFRESH_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "JWT_REFRESH_SECRET"
              }
            }
          }

          env {
            name = "NUXT_JWT_ACCESS_TTL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "JWT_ACCESS_TTL"
              }
            }
          }

          env {
            name = "NUXT_JWT_REFRESH_TTL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "JWT_REFRESH_TTL"
              }
            }
          }

          env {
            name = "SEED_SUPERADMIN_EMAIL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "SEED_SUPERADMIN_EMAIL"
              }
            }
          }

          env {
            name = "SEED_SUPERADMIN_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "SEED_SUPERADMIN_PASSWORD"
              }
            }
          }

          env {
            name = "SEED_SUPERADMIN_NAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app.metadata[0].name
                key  = "SEED_SUPERADMIN_NAME"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          security_context {
            allow_privilege_escalation = false
            read_only_root_filesystem  = false

            capabilities {
              drop = ["NET_RAW"]
            }
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 3000
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 3000
            }

            initial_delay_seconds = 30
            period_seconds        = 20
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "fullstack" {
  metadata {
    name      = "fullstack"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    selector = {
      app = "fullstack"
    }

    port {
      port        = 3000
      target_port = 3000
    }

    type = "NodePort"
  }
}

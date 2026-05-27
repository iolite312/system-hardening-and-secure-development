resource "kubernetes_namespace" "app" {
  metadata {
    name = var.environment
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
          image             = "postgres:17.5-alpine"
          image_pull_policy = "Always"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_DB"
            value = var.postgres_db
          }

          env {
            name  = "POSTGRES_USER"
            value = var.postgres_user
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = var.postgres_password
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
            exec {
              command = [
                "sh",
                "-c",
                "pg_isready -U ${var.postgres_user}"
              ]
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }

          liveness_probe {
            exec {
              command = [
                "sh",
                "-c",
                "pg_isready -U ${var.postgres_user}"
              ]
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

        security_context {
          run_as_non_root = true
        }

        container {
          name = "fullstack"

          # Use fixed version tag
          image             = var.image
          image_pull_policy = "Never"

          port {
            container_port = 3000
          }

          env {
            name  = "DATABASE_URL"
            value = "postgres://${var.postgres_user}:${var.postgres_password}@postgres:5432/${var.postgres_db}"
          }

          env {
            name  = "JWT_ACCESS_SECRET"
            value = var.jwt_access_secret
          }

          env {
            name  = "JWT_REFRESH_SECRET"
            value = var.jwt_refresh_secret
          }

          env {
            name  = "JWT_ACCESS_TTL"
            value = var.jwt_access_ttl
          }

          env {
            name  = "JWT_REFRESH_TTL"
            value = var.jwt_refresh_ttl
          }

          env {
            name  = "SEED_SUPERADMIN_EMAIL"
            value = var.seed_superadmin_email
          }

          env {
            name  = "SEED_SUPERADMIN_PASSWORD"
            value = var.seed_superadmin_password
          }

          env {
            name  = "SEED_SUPERADMIN_NAME"
            value = var.seed_superadmin_name
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

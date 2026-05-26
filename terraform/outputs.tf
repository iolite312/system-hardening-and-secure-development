output "namespace" {
  value = kubernetes_namespace.app.metadata[0].name
}

output "postgres_service_name" {
  value = kubernetes_service.postgres.metadata[0].name
}

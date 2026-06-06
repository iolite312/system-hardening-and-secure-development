terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "vault" {
  address         = var.vault_address
  token           = var.vault_token
  skip_tls_verify = true
}

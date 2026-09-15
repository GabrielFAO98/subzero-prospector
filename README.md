# 🎯 Subzero Prospector — Máquina Autônoma de Prospecção Local

Sistema desenvolvido para **Gabriel Azevedo** para prospectar empresas locais em **Franca - SP** e região, identificar empresas ativas sem site próprio, coletar dados/redes sociais, gerar protótipos de alta performance no padrão **Subzero Engine** e criar mensagens comerciais de abordagem rápida.

---

## ⚡ Como Usar em 1 Comando

Para rodar todo o fluxo de ponta a ponta (buscar empresas, qualificar quem não tem site, enriquecer contatos, gerar o site e preparar a mensagem de WhatsApp):

```bash
# Exemplo 1: Ar-condicionado em Franca
node src/cli.js pipeline "ar condicionado"

# Exemplo 2: Clínicas odontológicas
node src/cli.js pipeline "clinica odontologica"

# Exemplo 3: Energia Solar ou Estética
node src/cli.js pipeline "energia solar"
```

---

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `node src/cli.js pipeline "<nicho>"` | Executa o pipeline completo (Mineração + Enriquecimento + Protótipo + Mensagens) |
| `node src/cli.js list` | Lista todas as empresas mineradas, telefones, notas e links dos protótipos |
| `node src/cli.js open <numero_ou_slug>` | Abre o protótipo da empresa diretamente no navegador |
| `node src/cli.js message <numero_ou_slug>` | Exibe a mensagem de WhatsApp e E-mail personalizada e pronta para envio |

---

## 🚀 Como funciona o Pipeline

1. **Mineração no Google Maps:** O Playwright abre o Google Maps em segundo plano, busca pelo nicho e cidade, e filtra empresas com boa reputação (ex: notas 4.5+ com dezenas de avaliações) que **não possuem site cadastrado** ou usam apenas Linktree / redes sociais.
2. **Caça Autônoma de Contatos:** Identifica perfis no Instagram, Facebook, números de celular/WhatsApp e e-mails comerciais.
3. **Fábrica de Protótipos (Subzero Engine):** Clona a estrutura do `template.subzero`, preenche com os dados da empresa, avaliações reais de clientes, botões direcionados para o WhatsApp da empresa e crédito inline de Gabriel Azevedo.
4. **Mensagens Comerciais:** Gera o texto de WhatsApp e E-mail baseado no gancho das **Buscas por Inteligência Artificial (ChatGPT / Meta AI)** e na dor de perder clientes em Franca.

---

*Desenvolvido por Gabriel Azevedo • (16) 99204-8856*

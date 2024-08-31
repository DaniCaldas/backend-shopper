# Projeto Backend Shopper
## Instalação
Siga os passos abaixo para configurar o projeto localmente:
1. **Clone o repositório:**
   
  ```bash
  git clone https://github.com/DaniCaldas/backend-shopper.git
  npm install
  
  docker init
  docker compose up --build
  ```
## Tecnologias utilizadas
- Nodejs
- Express
- Prisma ORM
- Typescript
- MySQL

## Rotas
- /costumer  feita para gerar uma chave aleatória de um costumer
- /upload   feita para realizar leitura conforme os requisitos, em seu body ela necessita somente de: image: 'base64', 'costumer_code', 'measure_type'
- /list     foi feita para listar todas as measures conforme a necessidade e requisitos, exemplo de url: /:costumer_code/list?measure_type=measure_type

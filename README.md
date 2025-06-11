# DevOps - TestTrack

## 👥 Equipe
- Diogo Bonet Sobezak
- Gabriel de Macedo Lino Mocellin
- João Gabriel Trigo Stresser


## 📄 Descrição do Sistema
Breve descrição da API CRUD desenvolvida, incluindo:
- Linguagem utilizada: TypeScript (framework: Nest.js)
- Banco de dados: MySQL
- Endpoints CRUD implementados: testCase, users
- Testes: unitários e integrados.
- Documentação Swagger: disponível em `/docs`.

## 🔀 Estratégia de Branches
- Branch principal: `main`
- Branch de desenvolvimento: `develop`
- Branch de release: `release`
- Branches de tarefa: `usuario/tarefa`

## 🔧 Políticas de Branch
- Commits diretos na `main`: **não permitidos**.
- Pull requests: **obrigatórios**, com **aprovação** de ao menos 1 membro.

## 🔗 Azure Pipeline
- Arquivo de configuração: `azure-pipelines.yml`
- Stages implementados: build, test, deploy
- Deploy realizado no: **Azure App Service**
- Banco de dados: **DBaaS** - MySQL
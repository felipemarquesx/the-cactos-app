# 🌵 The Cactos Restaurant - App

Repositório destinado ao desenvolvimento do aplicativo móvel do **The Cactos Restaurant**. Construído com foco em escalabilidade e performance, utilizando React Native e Expo. O sistema contempla o fluxo completo de pedidos, reservas de mesas, gerenciamento de perfil e um programa de fidelidade integrado.

## 🚀 Funcionalidades

- **Autenticação:** Login e cadastro de usuários de forma segura utilizando Firebase Authentication.
- **Cardápio Digital:** Listagem de pratos e bebidas com sistema de busca, filtros por categoria e destaques do dia.
- **Carrinho e Pedidos:** Fluxo completo de adição ao carrinho e finalização de pedidos, pontuando automaticamente no programa de fidelidade.
- **Reservas de Mesas:** Agendamento de visitas ao restaurante com acompanhamento de status (Pendente/Confirmada).
- **Perfil e Fidelidade:** Dashboard do usuário com progresso no "Programa Cactos", acompanhamento de pontos, nível, histórico de visitas e pratos mais pedidos.

## 🛠️ Tecnologias Utilizadas

- **React Native** (Framework principal)
- **Expo / Expo Router** (Build e roteamento em abas)
- **TypeScript** (Tipagem estática)
- **Firebase** (Firestore para banco de dados e Authentication)
- **Context API** (Gerenciamento de estado global, ex: Carrinho)
- **Icons8** (Ícones ilustrativos da cultura brasileira para os avatares dos usuários)

## ⚙️ Como executar o projeto localmente

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure as Variáveis de Ambiente:
   - Faça uma cópia do arquivo `.env.example` na raiz do projeto e renomeie para `.env`.
   - Insira a chave de acesso privada na variável `EXPO_PUBLIC_FIREBASE_API_KEY` (solicite ao Felipe, caso não possua).

3. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npx expo start
   ```

## 👥 Equipe de Desenvolvimento
- Felipe
- Ítalo
- França
- Arlloudy
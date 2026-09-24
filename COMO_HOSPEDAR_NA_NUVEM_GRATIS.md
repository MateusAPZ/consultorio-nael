# ☁️ Guia Completo: Hospedar o Consultório na Nuvem Gratuitamente

Com este guia, o sistema do consultório dentário ficará disponível **24 horas por dia na internet**, podendo ser acessado de qualquer smartphone, tablet ou computador, mesmo com o computador do consultório desligado.

Tudo é **100% gratuito** e não requer cartão de crédito.

---

## 📋 Resumo dos 3 Passos:
1. **Passo 1**: Criar o Banco de Dados em Nuvem Gratuito (**MongoDB Atlas** - onde seus prontuários e agendamentos ficarão salvos para sempre).
2. **Passo 2**: Enviar o projeto para o seu **GitHub**.
3. **Passo 3**: Ligar o sistema no **Render.com** (que gera seu link público na internet com HTTPS).

---

## 🔹 PASSO 1: Criar o Banco de Dados Gratuito (MongoDB Atlas)

O MongoDB Atlas guarda todas as fichas, odontogramas e pagamentos com segurança na nuvem de forma gratuita para sempre (plano M0 Free).

1. Acesse o site oficial: **[https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**
2. Crie sua conta gratuita (pode entrar com o Google).
3. Na tela de criação do banco, selecione a opção **"M0 Free"** (Gratuito).
4. Em **Username and Password**, crie um usuário e uma senha (ex: usuário `drnael` e anote a senha que você criar!). Clique em **Create User**.
5. Em **Network Access** (ou "Where would you like to connect from?"), selecione **"Allow Access from Anywhere"** (ou adicione o IP `0.0.0.0/0`) para que a nuvem consiga conectar.
6. Clique em **Finish and Close** ou **Go to Databases**.
7. Na página do seu banco, clique no botão **Connect**:
   - Escolha **Drivers** (Node.js).
   - Ele vai mostrar uma linha parecida com esta:
     ```
     mongodb+srv://drnael:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```
   - Troque `<password>` pela senha que você criou e copie essa linha inteira. Guarde-a para o Passo 3!

---

## 🔹 PASSO 2: Enviar o Sistema para o seu GitHub

1. Entre na sua conta no **[https://github.com](https://github.com)**.
2. No canto superior direito, clique no botão **+** e selecione **"New repository"**.
3. Dê um nome ao repositório, por exemplo: `consultorio-nael`.
4. Pode deixar como **Public** ou **Private** (Privado) e clique em **Create repository**.
5. Copie a URL do seu repositório (ex: `https://github.com/seunome/consultorio-nael.git`).
6. Agora, na pasta `Sistema Nael` do seu computador:
   - Dê 2 cliques no arquivo:
     📄 **`ENVIAR_PARA_GITHUB.bat`**
   - Cole a URL do seu GitHub e aperte **ENTER**.
   - Em poucos segundos, todo o código do sistema estará no seu GitHub!

---

## 🔹 PASSO 3: Publicar no Render.com (Servidor 24h Gratuito)

1. Acesse: **[https://render.com](https://render.com)** e crie uma conta gratuita (você pode fazer login direto com seu GitHub!).
2. No painel inicial do Render, clique no botão azul **"New +"** e selecione **"Web Service"**.
3. Selecione a opção **"Build and deploy from a Git repository"** e clique em **Next**.
4. Conecte sua conta do GitHub e escolha o repositório `consultorio-nael`.
5. Preencha os campos (a maioria já vem automática):
   - **Name**: `consultorio-dr-nael` (ou o nome que preferir)
   - **Region**: `Ohio (US East)` ou `Frankfurt`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan Type**: Selecione **Free** (Gratuito)
6. Role a página até a seção **"Environment Variables"** (Variáveis de Ambiente) e clique em **Add Environment Variable**:
   - **Key**: `MONGODB_URI`
   - **Value**: Cole a linha que você copiou do MongoDB Atlas no Passo 1!
7. Clique no botão final: **"Create Web Service"**.

---

### 🎉 Pronto! Seu sistema está no ar!

O Render vai compilar o sistema (leva cerca de 2 a 3 minutos na primeira vez). Quando terminar, ele exibirá o seu link oficial seguro com cadeado:

👉 **`https://consultorio-dr-nael.onrender.com`**

Você já pode abrir esse link no seu celular (3G/4G/5G/Wi-Fi), salvar como ícone na tela de início do smartphone e usar em qualquer lugar do mundo!

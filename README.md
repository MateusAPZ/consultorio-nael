# 🦷 Dr. Nael Odontologia - Sistema de Gestão Odontológica

Sistema completo e moderno para consultórios e clínicas dentárias, desenvolvido especialmente para atender às rotinas clínicas de atendimento, prontuário dos pacientes, agendamento de consultas e gestão financeira com alertas de pagamentos em atraso.

---

## 🚀 Como Iniciar o Sistema (Muito Fácil)

### Opção 1: Com 1 Clique no Windows (Recomendado)
Dê um duplo clique no arquivo **`INICIAR_SISTEMA.bat`** na pasta do projeto. 
Ele iniciará o servidor automaticamente e abrirá o sistema no seu navegador em:
👉 **`http://localhost:5000`**

### Opção 2: Pelo Terminal / Prompt de Comando
```bash
# Iniciar o sistema completo
npm start
```
Acesse no seu navegador: **`http://localhost:5000`**

---

## 🎯 Principais Funcionalidades

### 1. 📋 Prontuário Eletrônico Completo
- **Ficha Cadastral**: Nome, CPF, Data de Nascimento (com cálculo automático de idade), Telefone/WhatsApp, E-mail, Endereço e Convênio (Particular, Unimed, Amil, Bradesco, etc.).
- **Odontograma Interativo (FDI 32 dentes)**:
  - Arcada Superior (Maxila) e Arcada Inferior (Mandíbula).
  - Identificação por cores dos dentes:
    - 🟢 **Hígido / Saudável**
    - 🔴 **Cárie**
    - 🔵 **Restaurado**
    - 🟣 **Canal / Endodontia**
    - ⚫ **Extraído / Ausente**
    - 🟡 **Implante Dentário**
    - 🔷 **Aparelho / Ortodontia**
  - Clicando em qualquer dente, você pode alterar o status e gravar notas clínicas detalhadas.
- **Anamnese Médica e Fatores de Risco**:
  - Alerta em destaque vermelho para **Alergias a Medicamentos** (Penicilina, AINEs, Dipirona, etc.).
  - Controle de Hipertensão, Diabetes, Fumante, Sangramento Gengival, Medicamentos de uso contínuo e queixa principal.
- **Evolução Clínica Cronológica**:
  - Registro detalhado de cada consulta com data, horário, dente/região tratada, descrição dos procedimentos e materiais utilizados, e profissional responsável.
  - Opção de já lançar a cobrança do procedimento diretamente para o financeiro.
- **Botão de Impressão**:
  - Permite imprimir ou salvar o prontuário em PDF com visual limpo.

### 2. 📅 Agenda Inteligente de Consultas
- **Visualização por período**: Hoje, Amanhã, Esta Semana ou seleção de qualquer data.
- **Controle de Status da Consulta**:
  - 📅 *Agendado*
  - ✅ *Confirmado*
  - ⏳ *Em Atendimento*
  - 🎯 *Concluído*
  - ❌ *Cancelado / Faltou*
- **Ações Rápidas**:
  - Botão com link direto para **WhatsApp** do paciente com mensagem personalizada pré-preenchida.
  - Botão para **abrir o prontuário eletrônico** diretamente do card da consulta.
  - **Alerta financeiro instantâneo**: cada consulta avisa visualmente se o paciente tem pagamentos pendentes ou atrasados antes mesmo de ele entrar no consultório!

### 3. 💰 Financeiro & Controle de Pagamentos (Atrasado ou Pago)
- **Cálculo Automático de Atraso**:
  - O sistema monitora a data de vencimento de cada procedimento. Se o vencimento passou e ainda não foi quitado, o status muda automaticamente para **🔴 ATRASADO**, calculando o número exato de dias em atraso!
- **Painel de Controle Financeiro**:
  - 🟢 **Total Pago / Recebido** no período
  - 🟡 **Total A Vencer (Pendente no prazo)**
  - 🔴 **Total em Atraso (com alerta vermelho e lista de inadimplentes)**
- **Ação com 1 Clique ("Dar Baixa / Receber")**:
  - Escolha da forma de pagamento: Pix, Cartão de Crédito, Cartão de Débito, Dinheiro em Espécie ou Boleto.
  - Data de liquidação e recibo.
- **Filtros e Busca**:
  - Filtrar rapidamente apenas as faturas **Atrasadas**, **Pendentes** ou **Pagas**.
  - Busca por nome do paciente ou descrição do procedimento.

### 4. 📊 Dashboard Executivo (Painel Geral)
- Contadores do dia: Consultas marcadas para hoje e atendimentos concluídos.
- Faturamento do mês e saldo pendente.
- Alerta em vermelho pulsante com a relação dos pacientes com parcelas atrasadas e botão direto para contato.
- Próximos 6 pacientes agendados na fila de atendimento.

---

## 💾 Persistência dos Dados
- Os dados da clínica ficam salvos localmente e com segurança no arquivo:
  `server/data/db.json`
- Para fazer um backup da clínica, basta copiar esse arquivo ou a pasta inteira.
- O sistema já vem inicializado com pacientes e agendamentos realistas para demonstração imediata.

---

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Plus Jakarta Sans font.
- **Backend**: Node.js, Express, REST API.
- **Banco de Dados**: Armazenamento JSON transacional e persistente local.

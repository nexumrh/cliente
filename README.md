# NexumCell — Portal do Cliente

O cliente entra com CPF, data de nascimento e os 4 últimos dígitos do celular: vê as faturas, paga com PIX, quita o contrato, assina o contrato pelo link do vendedor e comunica roubo, furto ou perda (o aparelho trava na hora).

## Arquivos
- `index.html` — o portal (não precisa mexer).
- `nexumcell-config.js` — **cole aqui o `firebaseConfig`** do projeto NexumCell e os endereços dos portais. Use o **mesmo conteúdo** em todos os repositórios NexumCell.

## Publicar (GitHub Pages)
1. Estes arquivos ficam no repositório `nexumrh/cliente`.
2. *Settings → Pages → Branch: main / (root) → Save*.
3. Endereço: `https://nexumrh.github.io/cliente/` (ou domínio próprio em *Custom domain*).
4. No Firebase: *Authentication → Configurações → Domínios autorizados* → adicione o domínio.

Sem `apiKey` no config, o portal abre em **modo demonstração** (dados de exemplo só no navegador).

# Olympikus Store

## Publicar na Vercel

O projeto usa Next.js e está preparado para importação do repositório no GitHub pela Vercel. O framework fica definido em `vercel.json`; os comandos padrão são `npm run build` e `npm run dev`.

Antes do primeiro deploy, cadastre em **Vercel → Project Settings → Environment Variables**:

- `FLEVOPAY_SECRET_KEY`: chave secreta da conta FlevoPay.
- `TIKTOK_ACCESS_TOKEN`: token da Events API do TikTok.

Não coloque os valores privados no código ou em arquivos versionados. O ID da loja FlevoPay (`10529`) e o ID do Pixel (`DAK3TN3C77UDHLL41DAG`) já são os valores padrão. Os nomes das variáveis estão em `vercel.env.example`.

## Pagamento e acompanhamento

O checkout cria cobranças Pix pela API da FlevoPay, mostra o QR Code ou código copia e cola e consulta o estado do pagamento. A rota `/api/flevo/webhook` recebe as notificações da FlevoPay. A tela de entrega aparece após a confirmação do pagamento e acompanha a preparação do pedido; rastreio real depende de integração com transportadora.

## Eventos do TikTok

O Pixel registra `ViewContent`, `AddToCart`, `InitiateCheckout`, `Search`, `AddToWishlist` e `Purchase`. Após a confirmação, o servidor também envia `Purchase` pela Events API usando o mesmo identificador de evento para deduplicação.

## Desenvolvimento

```sh
npm run dev
npm run build
npm run lint
```

# Manu Burguer

Projeto de cardápio digital mobile-first para hamburgueria com:

- produtos por categoria
- carrinho
- finalização de pedido
- envio para WhatsApp
- layout pronto para Android e iPhone
- estrutura separada em pastas

## Estrutura

```text
manu-burguer/
  index.html
  README.md
  public/
    assets/
      css/
        styles.css
      js/
        main.js
        store.js
        utils.js
      data/
        products.js
      images/
        coloca aqui as imagens dos produtos
```

## Onde editar cada coisa

### 1) Nome, preço, descrição e número do WhatsApp
Arquivo:

```text
public/assets/data/products.js
```

- troque o número em `WHATSAPP_NUMBER`
- altere nomes dos produtos
- altere preços
- altere descrições
- troque caminhos das imagens

## 2) Cores, visual, animações e responsividade
Arquivo:

```text
public/assets/css/styles.css
```

## 3) Regras do carrinho e envio para WhatsApp
Arquivo:

```text
public/assets/js/main.js
```

## 4) Imagens
Pasta:

```text
public/assets/images/
```

Coloque suas imagens com os mesmos nomes usados no `products.js`.

Exemplo:

```text
smash-manu.jpg
triplo-smash-manu.jpg
combo-familia.jpg
coca-lata.jpg
```

## Como testar no VS Code

Você pode abrir o projeto no VS Code e usar uma extensão como **Live Server**.

Passos:

1. abra a pasta `manu-burguer`
2. instale a extensão `Live Server`
3. clique com o botão direito no `index.html`
4. clique em `Open with Live Server`

## Como subir na Vercel

Como esse projeto é estático, é bem simples.

### Opção 1 — mais fácil
1. crie uma conta na Vercel
2. envie essa pasta para um repositório no GitHub
3. na Vercel clique em `Add New Project`
4. importe o repositório
5. deploy

### Opção 2 — arrastar a pasta pronta
Você também pode subir um projeto estático pelo painel da Vercel depois de compactar ou usar a CLI.

## Importante antes de publicar

- troque `5511999999999` pelo WhatsApp real da hamburgueria
- revise os preços
- coloque as fotos reais
- teste um pedido completo
- veja se o WhatsApp está abrindo corretamente no Android e iPhone

## Sugestão de melhoria futura

No futuro você pode adicionar:

- taxa de entrega por bairro
- retirada no balcão
- horário de funcionamento
- banner de promoção
- cupom
- adicionais por item

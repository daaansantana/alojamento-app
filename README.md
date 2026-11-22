# alojamento-app

Uma página só, em português, para a dona de uma casa de hóspedes com 8 quartos. A partir das reservas do próprio negócio, diz-lhe como correu o ano, o que fazer este mês, a que hóspedes escrever e quanto ganha por ano se mudar alguma coisa. Projeto final, em equipa de três.

Os dados vêm de `alojamento.xlsx`, convertido uma vez num JSON por folha. Não há backend: o browser lê os ficheiros de `public/data/`. A data de referência vem dos dados (2 de novembro de 2026), nunca do dia de hoje.

## Como correr

Precisa de Node 20.9 ou mais recente.

```bash
npm ci        # instala as versões exatas do package-lock.json
npm run dev   # http://localhost:3000
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run verificar` | Lint (Biome), testes, gabaritos, requisitos, tipos (`next typegen` e `tsc`) e build. Tem de passar antes de cada push. |
| `npm run gabaritos` | Compara as funções de `lib/` com os valores esperados da secção 4 do SPEC (`scripts/golden.test.ts`). |
| `npm run requisitos` | Confere os requisitos do enunciado e as regras do SPEC. Com `npm run requisitos -- --final`, falha também se faltar um entregável. |
| `npm run explorar` | Imprime a qualidade dos dados e os números da análise que o SPEC não tem. |
| `npm run capturas` | Guarda em `.capturas/` a página num telemóvel (390 px) e num computador (1280 px). Usa o build: corre `npm run build` antes. Precisa do Chrome. |

## Estrutura

```
app/                 a página (App Router): layout.tsx e page.tsx
components/painel/   as secções da página, que recebem tudo por props
components/states/   estados a carregar, erro e vazio
components/ui/       componentes do shadcn/ui (não editar à mão)
hooks/               a ponte entre os dados e a página (SPEC, secção 6)
lib/                 funções puras: sem fetch, sem store
services/data.ts     um fetch por folha (fetchRooms, fetchBookings)
store/               o store (Zustand): os dados carregados e o mês escolhido
types/index.ts       os tipos dos JSON e dos resultados
public/data/         quartos.json (8 quartos) e reservas.json (481 reservas)
scripts/             testes e verificações, corridos com tsx
docs/                o SPEC e a análise dos dados
.agents/skills/      skills dos agentes (.claude/skills aponta para aqui)
```

Fluxo dos dados: `public/data/*.json` → `services/` → `store/` → `hooks/`, que fazem as contas com `lib/` → `components/`.

## Documentos

- [PRODUCT.md](PRODUCT.md): a persona, o propósito da app e os princípios do desenho.
- [docs/SPEC.md](docs/SPEC.md): o contrato: regras dos dados, tipos, funções, valores esperados e hooks.
- [docs/ANALISE.md](docs/ANALISE.md): a análise dos dados (exploração, hipóteses, conclusões, indicadores e KPI), com a fonte de cada número. Em inglês: [docs/ANALYSIS.en.md](docs/ANALYSIS.en.md).
- [HIPOTESES.md](HIPOTESES.md): as seis hipóteses, o critério de cada uma e o resultado.

## Convenções

- Código, nomes e commits em inglês; textos da interface em português (pt-PT).
- Datas chegam como texto `"AAAA-MM-DD"` e convertem-se só dentro de `lib/`.
- Cada número vem de uma função pura em `lib/`, com o valor esperado em `scripts/golden.test.ts`. Os componentes recebem tudo por props.
- Antes de cada push: `npm run verificar`.

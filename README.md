# alojamento-app

App em Next.js para o dono de um alojamento com 8 quartos: reservas, ocupação, canais e hóspedes, a partir do Excel do negócio. Projeto final, em equipa de três.

Os dados vêm de `alojamento.xlsx`, convertido uma vez num JSON por folha. Não há backend: o browser lê os ficheiros de `public/data/`. As hipóteses que queremos testar estão em [HIPOTESES.md](HIPOTESES.md).

## Como correr

Precisa de Node 20 ou mais recente.

```bash
npm install
npm run dev        # http://localhost:3000
npm run verificar  # lint, testes, tsc e build
npm run requisitos  # requisitos do enunciado e regras do SPEC
```

## Estrutura

```
app/               rotas, layouts e páginas (App Router)
components/ui/     componentes do shadcn/ui (não editar à mão)
components/states/ estados a carregar, erro e vazio
lib/               funções puras: sem fetch, sem store
services/data.ts   um fetch por folha (fetchRooms, fetchBookings)
types/index.ts     Room e Booking, com as chaves exatas dos JSON
public/data/       quartos.json (8 quartos) e reservas.json (481 reservas)
scripts/           testes, corridos com tsx
.agents/skills/    skills dos agentes (.claude/skills aponta para aqui)
```

Fluxo dos dados: `public/data/*.json` → `services/` → `lib/` → hooks → componentes.

## Convenções

- Código, nomes e commits em inglês; textos da interface em português.
- Datas chegam como texto `"AAAA-MM-DD"` e convertem-se só dentro de `lib/`.
- Antes de cada push: `npm run verificar`.

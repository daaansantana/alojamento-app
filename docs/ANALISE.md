# Análise dos dados do alojamento

Os números deste documento vêm de três sítios, e cada tabela diz de onde: o contrato dos dados (`docs/SPEC.md`, «SPEC»), as hipóteses registadas antes de ver os dados (`HIPOTESES.md`, «HIPOTESES») e o script `npm run explorar` («explorar»), que só calcula o que o SPEC não tem. As referências de mercado estão em `lib/benchmarks.ts`, com a fonte de cada uma.

## 1. Para quem e para quê: a persona

A persona está descrita em [PRODUCT.md](../PRODUCT.md). Em resumo:

- É a dona de um alojamento com 8 quartos, que gere sozinha.
- Não está habituada a dados nem confia muito em ferramentas digitais. Conhece as extranets do Booking e do Airbnb, o email e o telemóvel.
- Abre a app entre tarefas, muitas vezes no telemóvel, e quer saber o que fazer a seguir, não ler gráficos.
- As perguntas dela: «Como correu o ano?», «O que devo fazer este mês?», «Quanto ganho se mudar alguma coisa?».

A pergunta do professor guia esta análise:

> Com estes dados, quanto o que vamos construir é interessante para a persona?

Para lhe responder, a análise mostra o que os dados dizem sobre a casa, que decisões a dona pode tomar com eles e quanto valem essas decisões por ano. A resposta, com o número, está na secção 6.

## 2. Os dados

Os dados vêm do Excel do negócio, `alojamento.xlsx`, convertido uma vez num JSON por folha, em `public/data/`.

| Folha | Linhas | Colunas | O que tem | Fonte |
| --- | --- | --- | --- | --- |
| `quartos.json` | 8 | 5 | nome, tipo, capacidade e preço por noite de cada quarto | explorar |
| `reservas.json` | 481 | 12 | uma linha por reserva: quarto, hóspede, país, datas, noites, hóspedes, canal, total e estado | explorar |

- **Período:** de 1 de novembro de 2025 a 31 de outubro de 2026. São 365 dias × 8 quartos = 2920 noites disponíveis (SPEC §1).
- **Data de referência:** 2 de novembro de 2026, a última saída de uma estada concluída. Calcula-se a partir dos dados, nunca a partir de hoje (SPEC §1).

As regras do SPEC §1, por palavras simples:

- **Estados.** «Concluída» é uma estada que aconteceu. «Cancelada» foi cancelada. «Confirmada» está marcada e ainda não aconteceu. Noites, receita, ocupação e tudo o que é sobre hóspedes contam só as concluídas. As canceladas só entram nas taxas de cancelamento.
- **Canais.** Booking, Airbnb e Direto. «Plataformas» quer dizer Booking e Airbnb.
- **Cada noite pertence ao seu dia.** Uma estada de 30 de janeiro a 2 de fevereiro põe 2 noites em janeiro e 1 em fevereiro. Por isso o período tem 1344 noites e 133 985 €, e as estadas concluídas somam 1345 noites e 134 065 €: a reserva 477 tem 1 noite depois de 31 de outubro.
- **O `total` é o preço de tabela, antes da comissão.** É igual em todos os canais. As comissões vêm das taxas públicas em `lib/benchmarks.ts`.
- **Um hóspede é um email.** Cada email tem um só nome.
- **O país é da reserva, não do hóspede.** 82 dos 102 hóspedes que voltam aparecem com mais de um país.
- **As estadas de um hóspede ordenam-se pela data de entrada**, e depois pelo número da reserva.

### Qualidade dos dados

O `npm run explorar` verifica as duas folhas. Nenhuma regra falha.

| Verificação | Resultado | Fonte |
| --- | --- | --- |
| Vazios | 0 nas duas folhas | explorar |
| Duplicados exatos e números de reserva repetidos | 0 | explorar |
| Datas de entrada | de 2025-11-01 a 2026-10-31 | explorar |
| Datas de saída | de 2025-11-03 a 2026-11-03; a última saída concluída é 2026-11-02 | explorar |
| Estados | 440 concluídas (91%), 37 canceladas (8%), 4 confirmadas (1%) | explorar |
| `nights` igual à saída menos a entrada | 0 falhas | explorar |
| Todo o `room_id` existe em `quartos` | 0 falhas | explorar |
| Hóspedes dentro da capacidade do quarto | 0 falhas | explorar |
| Um nome por email | 0 falhas; 329 emails e 329 nomes | explorar |
| `total` igual ao preço do quarto × noites | sempre, nas 481 reservas | explorar |

| Dimensão | Nota (1 a 5) | Porquê | Fonte |
| --- | --- | --- | --- |
| Completude | 5 | nenhum vazio | explorar |
| Consistência | 5 | datas, noites, valores e capacidade batem | explorar |
| Unicidade | 5 | sem duplicados | explorar |
| Atualidade | 4 | é uma fotografia fixa de um ano, que acaba a 2026-11-02 | explorar |
| Exatidão | 5 | um nome por email; o preço é sempre o do quarto | explorar |
| Integridade | 5 | todas as reservas apontam para um quarto que existe | explorar |

Leitura: os dados estão limpos. Não foi preciso corrigir nem apagar nenhuma linha. Esta limpeza também é um sinal de que a base é fictícia (ver secção 7).

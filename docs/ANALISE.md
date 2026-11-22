# Análise dos dados do alojamento

Os números deste documento vêm de três sítios, e cada tabela diz de onde: o contrato dos dados (`docs/SPEC.md`, «SPEC»), as hipóteses registadas antes de ver os dados (`HIPOTESES.md`, «HIPOTESES») e o script `npm run explorar` («explorar»), que só calcula o que o SPEC não tem. As referências de mercado estão em `lib/benchmarks.ts`, com a fonte de cada uma.

## 1. Para quem e para quê: a persona

A persona está descrita em [PRODUCT.md](../PRODUCT.md). Em resumo:

- É a Isabel, a dona de um alojamento com 8 quartos, que gere sozinha.
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

## 3. Exploração

### O ano

| Noites vendidas | Noites disponíveis | Ocupação | Receita | Preço médio por noite | Receita por quarto disponível | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| 1344 | 2920 | 46% | 133 985 € | 99,69 € | 45,89 € | SPEC §4, Período inteiro |

Leitura: a casa vendeu menos de metade das noites. 54% das noites do ano ficaram por vender (explorar, ponto 8).

### Os meses

| Mês | Ocupação | Receita | Procura | Fonte |
| --- | --- | --- | --- | --- |
| nov 2025 | 38% | 9550 € | menos procurado | SPEC §4, Por mês e Termómetro |
| dez 2025 | 39% | 9595 € | menos procurado | SPEC §4, Por mês e Termómetro |
| jan 2026 | 32% | 7715 € | menos procurado | SPEC §4, Por mês e Termómetro |
| fev 2026 | 41% | 9180 € | normal | SPEC §4, Por mês e Termómetro |
| mar 2026 | 44% | 10 615 € | normal | SPEC §4, Por mês e Termómetro |
| abr 2026 | 50% | 12 390 € | normal | SPEC §4, Por mês e Termómetro |
| mai 2026 | 50% | 12 105 € | normal | SPEC §4, Por mês e Termómetro |
| jun 2026 | 51% | 12 400 € | normal | SPEC §4, Por mês e Termómetro |
| jul 2026 | 56% | 13 475 € | mais procurado | SPEC §4, Por mês e Termómetro |
| ago 2026 | 65% | 15 990 € | mais procurado | SPEC §4, Por mês e Termómetro |
| set 2026 | 48% | 11 555 € | normal | SPEC §4, Por mês e Termómetro |
| out 2026 | 40% | 9415 € | menos procurado | SPEC §4, Por mês e Termómetro |

«Mais procurado» é uma ocupação de 55% ou mais; «menos procurado», de 40% ou menos (SPEC §3, `THERMOMETER`).

Leitura: agosto foi o melhor mês e janeiro o pior. De novembro a fevereiro ficaram 600 das 960 noites por vender, 62,5% (SPEC §4, Alert facts; explorar, ponto 8).

### Os quartos

| Quarto | Noites | Ocupação | Receita | Fonte |
| --- | --- | --- | --- | --- |
| Suite Mar | 146 | 40% | 20 440 € | SPEC §4, Por quarto |
| Quarto Duplo Vista Mar 1 | 191 | 52% | 20 055 € | SPEC §4, Por quarto |
| Quarto Duplo Vista Mar 2 | 156 | 43% | 16 380 € | SPEC §4, Por quarto |
| Quarto Duplo Jardim | 188 | 52% | 15 980 € | SPEC §4, Por quarto |
| Quarto Twin | 166 | 45% | 13 280 € | SPEC §4, Por quarto |
| Quarto Familiar | 173 | 47% | 20 760 € | SPEC §4, Por quarto |
| Estúdio Terraço | 153 | 42% | 16 830 € | SPEC §4, Por quarto |
| Quarto Individual | 171 | 47% | 10 260 € | SPEC §4, Por quarto |

Leitura: nenhum quarto passa dos 52%. Os dois duplos com vista mar têm o mesmo preço mas não a mesma procura: o segundo esteve ocupado em 26 das 120 noites de inverno (SPEC §4, Winter room).

### Os canais

| Canal | Reservas | Noites | Parte das noites | Receita | Comissão | Fica por noite | Fonte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Booking | 220 | 632 | 47,0% | 62 595 € | 9389,25 € | 84,19 € | SPEC §4, Channel mix e Net revenue |
| Direto | 127 | 383 | 28,5% | 37 605 € | 0 € | 98,19 € | SPEC §4, Channel mix e Net revenue |
| Airbnb | 134 | 329 | 24,5% | 33 785 € | 5236,68 € | 86,77 € | SPEC §4, Channel mix e Net revenue |

As comissões usam as taxas típicas: 15% no Booking e 15,5% no Airbnb (`lib/benchmarks.ts`).

Leitura: as comissões somam 14 626 €, 10,9% da receita do período (SPEC §4). As plataformas vendem 71,5% das noites. Nos hotéis europeus com menos de 20 quartos, essa parte é 32,1% (HOTREC 2024, em `lib/benchmarks.ts`).

### Os cancelamentos

| Canal | Canceladas / reservas | Taxa | Fonte |
| --- | --- | --- | --- |
| Airbnb | 11 / 134 | 8,2% | SPEC §4, Cancellations |
| Booking | 17 / 220 | 7,7% | SPEC §4, Cancellations |
| Direto | 9 / 127 | 7,1% | SPEC §4, Cancellations |
| Todas | 37 / 481 | 7,7% | SPEC §4, Cancellations |

| País da reserva | Canceladas / reservas | Taxa | Fonte |
| --- | --- | --- | --- |
| Alemanha | 6 / 46 | 13,0% | SPEC §4, Cancellations |
| Espanha | 10 / 81 | 12,3% | SPEC §4, Cancellations |
| Brasil | 5 / 45 | 11,1% | SPEC §4, Cancellations |
| França | 4 / 39 | 10,3% | SPEC §4, Cancellations |
| Portugal | 9 / 166 | 5,4% | SPEC §4, Cancellations |
| Países Baixos | 2 / 38 | 5,3% | SPEC §4, Cancellations |
| Reino Unido | 1 / 66 | 1,5% | SPEC §4, Cancellations |

Leitura: o canal não muda os cancelamentos; a diferença não é significativa (p = 0,94, SPEC §5, H2). Os países têm poucas reservas cada, por isso as taxas por país são frágeis.

### Quem volta

| Grupo | Hóspedes | Estadas | Gasto | Por estada | Por hóspede | Fonte |
| --- | --- | --- | --- | --- | --- | --- |
| Quem volta | 102 | 230 | 69 535 € | 302 € | 682 € | SPEC §4, Guest totals; explorar, ponto 4 |
| Veio uma vez | 210 | 210 | 64 530 € | 307 € | 307 € | explorar, ponto 4 |

| O quê | Valor | Fonte |
| --- | --- | --- |
| Parte de quem volta no gasto | 51,9% de 134 065 € | SPEC §4, Guest totals |
| Quem volta vale, por hóspede, no ano | 2,22 vezes mais | explorar, ponto 4 |
| Regressos (estadas depois da primeira) | 128, 38 115 € | SPEC §4, Guests |
| Regressos pelas plataformas | 95 de 128 (74%), 28 265 € | SPEC §4, Guests; explorar, ponto 8 |
| Comissão desses regressos, com 15% | 4239,75 € | SPEC §4, Direct-booking simulator |
| Comissão desses regressos, do mínimo ao máximo | 3317,55 € a 4895,58 € | explorar, ponto 6 |
| Primeira estada direta, regressos pelas plataformas | 27 de 37 | SPEC §5, achados exploratórios |
| Estadas de inverno: quem volta / veio uma vez | 25% / 32% | explorar, ponto 5 |
| Hóspedes que voltam e já vieram no inverno | 49 | SPEC §4, Winter returners |

O mínimo da comissão usa o Booking a 15% e o Airbnb a 3% (taxa repartida); o máximo, o Booking a 18% (com Preferred Partner) e o Airbnb a 15,5% (`lib/benchmarks.ts`).

Leitura: quem volta gasta o mesmo por estada, mas vale mais do dobro no ano porque volta. Traz metade do que os hóspedes gastam, e 3 em cada 4 regressos chegam por uma plataforma, que cobra comissão por um hóspede que já é da casa.

### As noites soltas

| O quê | Valor | Fonte |
| --- | --- | --- |
| Noites vazias entre duas estadas no mesmo quarto | 87 | SPEC §4, Orphan nights |
| Dessas, de junho a setembro | 46 | SPEC §4, Orphan nights |

Leitura: uma noite solta é difícil de vender a quem procura duas ou mais. Há 87 no ano, e mais de metade no verão, quando a procura é maior.

### O preço

| O quê | Valor | Fonte |
| --- | --- | --- |
| Preço por noite dos 8 quartos | de 60 € a 140 € | explorar, ponto 2 |
| `total` igual ao preço do quarto × noites | em todas as 481 reservas | explorar, ponto 2 |
| Preços diferentes no mesmo quarto, por canal, mês ou nº de hóspedes | 1 (nunca muda) | explorar, ponto 2 |
| Preço médio por noite, mês a mês | de 96,07 € a 104,12 € | SPEC §4, Termómetro |
| Ocupação, mês a mês | de 32% a 65% | SPEC §4, Termómetro |
| +10% em julho e agosto, com as mesmas noites | 2946,50 € a mais | SPEC §4, Pricing simulator |
| Noites que podia perder em julho e agosto e ganhar o mesmo | até 27 | SPEC §4, Pricing simulator |

Leitura: o preço é o mesmo o ano todo, em todos os canais. A ocupação duplica de janeiro para agosto e o preço não acompanha.

### Como são as estadas

| O quê | Valor | Fonte |
| --- | --- | --- |
| Estadas concluídas | 440 | explorar, ponto 3 |
| Noites por estada | média de 3,06; 2 noites em 28% e 3 noites em 28% | explorar, ponto 3 |
| Estadas de uma pessoa | 226 (51%) | explorar, ponto 3 |
| País da reserva mais frequente | Portugal, 157 (36%); depois Espanha, 70 (16%) | explorar, ponto 3 |
| Dia de entrada | entre 12% (segunda) e 16% (terça e sábado) | explorar, ponto 3 |
| Mês de entrada | entre 6% (janeiro e fevereiro) e 10% (abril, agosto e setembro) | explorar, ponto 3 |

Leitura: estadas curtas, metade de uma só pessoa, e entradas espalhadas pela semana. Não há um dia de entrada que se destaque.

## 4. Hipóteses

Estas seis hipóteses foram registadas em `HIPOTESES.md` antes de vermos os resultados. Os critérios não mudaram depois.

| # | Hipótese | Critério | Resultado | Estado | Fonte |
| --- | --- | --- | --- | --- | --- |
| H1 | Quem volta continua a reservar pelo canal da primeira vez | Mais de metade dos regressos usa o canal da primeira reserva | 34% dos regressos (44 de 128); ao acaso seriam 36% (p = 0,80) | Rejeitada | HIPOTESES H1; SPEC §5 |
| H2 | As reservas diretas valem mais | Estada direta 0,3 noites acima das plataformas e cancelamentos 2 pontos abaixo | Estada direta 0,33 noites mais longa (3,302 contra 2,969); cancelamentos 0,8 pontos abaixo (7,09% contra 7,91%); nenhuma diferença é significativa | Rejeitada | HIPOTESES H2; SPEC §5 |
| H3 | A casa depende mais das plataformas do que um hotel europeu pequeno | Mais de 32,1% das noites por plataformas | 71,5% das noites por plataformas | Confirmada | HIPOTESES H3; SPEC §5 |
| H4 | Quem viaja sozinho fica em quartos maiores do que precisa | Mais de 20% das estadas de uma pessoa em quartos para 3 ou 4 | 21,2% (48 de 226); estatisticamente igual a 20% (p = 0,35) | Confirmada pelo critério | HIPOTESES H4; SPEC §5 |
| H5 | No inverno, um quarto pode sair das reservas curtas sem perder clientes | Nenhuma noite de novembro a fevereiro com os 8 quartos ocupados | No máximo 7 dos 8 quartos ocupados | Confirmada | HIPOTESES H5; SPEC §5 |
| H6 | Quem menos cancela é quem mais volta | Os 2 países com menos cancelamentos estão entre os 3 com mais hóspedes que voltam | Menos cancelam: Reino Unido e Países Baixos. Mais voltam: Portugal, Espanha e Reino Unido | Rejeitada | HIPOTESES H6; SPEC §5 |

O que mudam na app:

- **H1 rejeitada:** quem volta não tem lealdade a um canal. Vale a pena pedir-lhe que reserve diretamente.
- **H2 rejeitada:** a reserva direta não vale mais por ser mais longa ou cancelar menos. Vale mais porque não paga comissão.
- **H3 confirmada:** a casa depende muito das plataformas, e por isso das comissões.
- **H5 confirmada:** no inverno há sempre pelo menos um quarto livre. É espaço para convidar quem já veio nessa altura.

### Achados exploratórios (não registados antes de ver os dados)

Estes achados vieram de explorar os dados depois de testar as hipóteses. Mostram-se à parte e com a sua incerteza.

| Achado | Valor | Fonte |
| --- | --- | --- |
| Um só preço por quarto, igual o ano todo, em todos os canais e para qualquer número de hóspedes | 1 preço por quarto | SPEC §5; explorar, ponto 2 |
| Depois da comissão, uma noite vale | 98,19 € direto, 86,77 € no Airbnb, 84,19 € no Booking | SPEC §5 |
| Quem volta gasta o mesmo por estada que quem veio uma vez | 302 € contra 307 €; vale 2,2 vezes mais no ano | SPEC §5; explorar, ponto 4 |
| Quem reservou direto da primeira vez voltou pelas plataformas | 27 de 37 estadas (73%, intervalo de 95%: 57% a 85%) | SPEC §5 |
| Quem volta vem menos no inverno, mas 49 já vieram nessa altura | 25% das estadas contra 32% | SPEC §5; explorar, ponto 5 |
| Noites soltas | 87, 46 delas de junho a setembro | SPEC §5 |
| Estadas de uma semana parecem mais diretas, mas não é um achado | 14 de 36 (39%); o intervalo de 95% (25% a 55%) inclui os 26% gerais | SPEC §5 |

## 5. Conclusões

**O problema numa frase:** a dona vive de quem volta, que traz metade do que os hóspedes gastam (51,9%), mas paga comissão em 3 de cada 4 regressos (95 de 128), cobra o mesmo preço o ano inteiro e deixa mais de metade das noites por vender (54%).

Fontes: SPEC §4, Guest totals e Guests; explorar, pontos 2 e 8.

A app apoia quatro decisões. Cada uma tem o número que a sustenta.

| Decisão | O que os dados mostram | Quanto vale | Fonte |
| --- | --- | --- | --- |
| **Quem contactar e quando.** No inverno, escrever a quem já veio nessa altura. | 600 noites de inverno por vender; 49 hóspedes que voltam já vieram de novembro a fevereiro | Se 1 em cada 5 voltar, com 10% de desconto: 10 estadas e 2643,84 € | SPEC §4, Alert facts e Winter campaign |
| **Que desconto dar na reserva direta.** Pedir a quem volta pelas plataformas que reserve diretamente, com um desconto abaixo da comissão. | 95 regressos pelas plataformas pagaram 4239,75 € de comissão; quem volta não é leal a um canal (H1) | Se metade passar a reservar diretamente, com 5% de desconto: 1413,25 € por ano. O desconto deixa de compensar quando chega aos 15%, a comissão | SPEC §4, Direct-booking simulator; HIPOTESES H1 |
| **Que preço cobrar em cada época.** Subir um pouco o preço nos meses mais procurados. | Julho e agosto com 56% e 65% de ocupação, ao preço de sempre | +10% em julho e agosto, com as mesmas noites: 2946,50 €. Pode vender até 27 noites a menos e ganhar o mesmo | SPEC §4, Pricing simulator |
| **As noites soltas.** Vender as noites vazias entre duas estadas, por exemplo com um preço para uma noite. | 87 noites soltas, 46 de junho a setembro | Sem valor estimado: o SPEC não tem um simulador para elas | SPEC §4, Orphan nights |

Leitura: as três primeiras decisões têm um valor em euros que vem dos dados da casa. A quarta fica como aviso, sem número, até haver uma regra para a estimar.

## 6. Indicadores e KPI

### Indicadores do negócio

| Indicador | Valor da casa | Comparação | Fonte |
| --- | --- | --- | --- |
| Ocupação (noites vendidas ÷ disponíveis) | 46% | de 32% em janeiro a 65% em agosto | SPEC §4, Período inteiro e Por mês |
| Preço médio por noite (receita ÷ noites vendidas) | 99,69 € | de 96,07 € a 104,12 € ao longo dos meses | SPEC §4, Período inteiro e Termómetro |
| Receita por quarto disponível (receita ÷ noites disponíveis) | 45,89 € | 72,4 € em Portugal em 2025: a casa fica nos 63% | SPEC §4; INE 2025, em `lib/benchmarks.ts`; explorar, ponto 8 |
| Parte das comissões na receita | 10,9% (14 625,93 €) | — | SPEC §4, Net revenue |
| Parte de quem volta no gasto | 51,9% | — | SPEC §4, Guest totals |
| Valor de 1 ponto de ocupação | 2910,98 € por ano (29,2 noites × 99,69 €) | — | explorar, ponto 7 |

A comparação com o INE é só uma referência: é um valor de Portugal inteiro, e esta é uma casa com 8 quartos.

### O KPI: quanto a casa pode ganhar por ano

O KPI soma duas decisões da secção 5: os regressos pelas plataformas que passam a reservar diretamente e as estadas a mais no inverno, ao preço normal. Não conta a subida de preço no verão.

| Cenário | Quem volta pelas plataformas e passa a direto | Desconto direto | Hóspedes de inverno que voltam | Direto | Inverno | Total por ano | Peso na receita do ano | Fonte |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Prudente | 1 em cada 5 (20%) | 5% | 1 em cada 10 (10%) | 565,30 € | 1468,80 € | 2034,10 € (cerca de 2030 €) | 1,5% | SPEC §4, Yearly gain scenarios; explorar, ponto 8 |
| Provável | metade (50%) | 5% | 1 em cada 5 (20%) | 1413,25 € | 2937,60 € | 4350,85 € (cerca de 4350 €) | 3,2% | SPEC §4, Yearly gain scenarios; explorar, ponto 8 |
| Otimista | todos (100%) | 0% | 3 em cada 10 (30%) | 4239,75 € | 4406,40 € | 8646,15 € (cerca de 8650 €) | 6,5% | SPEC §4, Yearly gain scenarios; explorar, ponto 8 |

A comissão usada é a típica do Booking, 15% (`lib/benchmarks.ts`). As estadas de inverno valem 293,76 € cada, a média das estadas de inverno (SPEC §4, Winter campaign).

### A resposta à pergunta do professor

Com estes dados, a app é interessante para a persona porque lhe diz quem contactar e com que desconto, o que vale cerca de 4350 € por ano no cenário mais provável (entre cerca de 2030 € e 8650 €, 3,2% da receita do ano), sem obras nem mais quartos.

## 7. Limites, fontes e próximo passo

### Limites

- **A base é fictícia, mas é tratada como facto.** Os dados não têm vazios, erros nem duplicados (secção 2), e o preço nunca muda. Num alojamento real, os números seriam outros. O método e a app ficam iguais.
- **Há só um ano.** Não dá para separar a época do acaso, nem ver se um mês fraco se repete.
- **Não há data de reserva.** Não se sabe com quanta antecedência cada hóspede reserva, por isso a app não diz quando subir ou baixar o preço antes de uma data.
- **Não há preços da concorrência.** A app não sabe se 99,69 € por noite está acima ou abaixo do mercado à volta. Só tem a comparação nacional do INE.
- **Os cenários são suposições.** Quantos hóspedes aceitam reservar diretamente ou voltar no inverno não está nos dados. Por isso o KPI tem três cenários e não um só número.
- **Amostras pequenas.** Por país e por tipo de estada há poucas reservas. Os testes que o SPEC §5 mostra (H1, H2 e H4) dizem que várias diferenças não são significativas.

### Fontes

Referências de mercado, em `lib/benchmarks.ts`:

| Referência | Valor | Fonte |
| --- | --- | --- |
| Comissão típica do Booking | 15%; de 10% a 25%; mais cerca de 3% com Preferred Partner | Hostfully, «Booking.com host fees», 4 nov 2026 |
| Taxa do Airbnb só para o anfitrião | 15,5%; cerca de 3% com a taxa repartida | Airbnb, «Simplifying Airbnb service fees» |
| Parte das noites por plataformas em hotéis europeus com menos de 20 quartos | 32,1% (direto: 59,5%), dados de 2023 | HOTREC European Hotel Distribution Study 2024 |
| Receita por quarto disponível em Portugal, 2025 | 72,4 € | INE, Estatísticas do Turismo 2025 (noticiado pelo ECO, 10 jul 2026) |
| Data desde a qual o Booking não pode impor paridade de preços | 14 nov 2024 | Comissão Europeia, ficha do Regulamento dos Mercados Digitais sobre o Booking.com, 28 set 2026 |

Contexto da persona, em `PRODUCT.md`:

| Dado | Valor | Fonte |
| --- | --- | --- |
| Donos de alojamento local que gerem sozinhos | 76% | NOVA SBE para a ALEP, 2023 |
| Titulares de registo com um só alojamento | 8 em cada 10 | RNAL, no estudo da NOVA SBE para a ALEP, 2025 |
| Donos para quem o alojamento é mais de 60% do orçamento da família | 39% | NOVA SBE para a ALEP, 2023 |
| Pessoas dos 16 aos 74 anos com competências digitais abaixo do básico, em Portugal | 27,6% | Comissão Europeia, Digital Skills Indicator 2.0, 2025 |
| Pessoas dos 16 aos 74 anos que não usam a internet, em Portugal | 10,6% | Comissão Europeia, Digital Skills Indicator 2.0, 2025 |

### Próximo passo

Um agente que vigia os preços do mercado à volta da casa e avisa a dona quando vale a pena mudar o preço. Respondia ao limite dos preços da concorrência. Precisa de dados de fora e de um servidor que corra sozinho, e o enunciado não prevê nenhum dos dois: a app de hoje não tem servidor e só lê os ficheiros de `public/data/`.

O resto da visão do produto (ser encontrada no Google, a página da casa, o cartão à saída e o calendário único) está em [PRODUCT.md](../PRODUCT.md), na secção «Product Vision».

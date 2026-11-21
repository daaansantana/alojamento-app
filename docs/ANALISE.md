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

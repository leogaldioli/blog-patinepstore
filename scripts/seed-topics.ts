/**
 * Popula a tabela blog_topics no Supabase com os 590 tópicos iniciais.
 * Uso: npx tsx scripts/seed-topics.ts
 * Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Topic = {
  keyword: string;
  title_suggestion: string;
  category: string;
  priority: number;
};

const topics: Topic[] = [
  // ─── GUIA DE COMPRA (80) ──────────────────────────────────────────────────
  { keyword: "melhor patinete elétrico 2026", title_suggestion: "Melhor Patinete Elétrico de 2026: Guia Completo para Escolher o Certo", category: "guia-de-compra", priority: 10 },
  { keyword: "melhor patinete elétrico custo benefício", title_suggestion: "Melhor Patinete Elétrico Custo-Benefício: Os 5 Melhores do Mercado", category: "guia-de-compra", priority: 10 },
  { keyword: "patinete elétrico para adulto", title_suggestion: "Patinete Elétrico para Adulto: Como Escolher e Quais São os Melhores", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico para adulto pesado", title_suggestion: "Patinete Elétrico para Adulto Pesado: Modelos que Suportam Mais de 100kg", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico para trabalho", title_suggestion: "Patinete Elétrico para Ir ao Trabalho: O Que Avaliar Antes de Comprar", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico para subir ladeira", title_suggestion: "Patinete Elétrico para Subir Ladeira: Potência e Motor Que Realmente Funcionam", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico 500w", title_suggestion: "Patinete Elétrico 500W: Vale a Pena ou É Fraco Demais?", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico 800w", title_suggestion: "Patinete Elétrico 800W: Para Quem é e Quais São os Melhores", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico 1000w", title_suggestion: "Patinete Elétrico 1000W: Potência de Verdade para Uso Diário", category: "guia-de-compra", priority: 8 },
  { keyword: "foston s09 pro vale a pena", title_suggestion: "Foston S09 Pro.2: Review Completo — Vale a Pena Comprar em 2026?", category: "guia-de-compra", priority: 10 },
  { keyword: "foston x5 review", title_suggestion: "Foston X5: Análise Honesta de Quem Vende e Faz Manutenção", category: "guia-de-compra", priority: 9 },
  { keyword: "foston x4 review", title_suggestion: "Foston X4: Especificações, Autonomia Real e Para Quem Indica", category: "guia-de-compra", priority: 9 },
  { keyword: "foston x10 review", title_suggestion: "Foston X10: O Patinete Mais Potente da Foston Vale o Preço?", category: "guia-de-compra", priority: 9 },
  { keyword: "foston x3 review", title_suggestion: "Foston X3: Bom Para Iniciantes? Review Completo", category: "guia-de-compra", priority: 8 },
  { keyword: "bee green pro basic review", title_suggestion: "Bee Green Pro Basic: Vale a Pena? Análise Completa", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico vs bicicleta elétrica", title_suggestion: "Patinete Elétrico vs Bicicleta Elétrica: Qual Escolher em 2026?", category: "guia-de-compra", priority: 9 },
  { keyword: "scooter elétrica vs moto elétrica", title_suggestion: "Scooter Elétrica vs Moto Elétrica: Diferenças, Custo e Quando Escolher Cada Uma", category: "guia-de-compra", priority: 8 },
  { keyword: "como escolher patinete elétrico", title_suggestion: "Como Escolher um Patinete Elétrico: 7 Critérios que Fazem Diferença", category: "guia-de-compra", priority: 10 },
  { keyword: "patinete elétrico com banco adulto", title_suggestion: "Patinete Elétrico com Banco para Adulto: Conforto ou Perda de Agilidade?", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico off road", title_suggestion: "Patinete Elétrico Off-Road: Modelos para Terrenos Difíceis e Irregulares", category: "guia-de-compra", priority: 7 },
  { keyword: "patinete elétrico dobrável", title_suggestion: "Patinete Elétrico Dobrável: Praticidade para Usar no Transporte Público", category: "guia-de-compra", priority: 7 },
  { keyword: "patinete elétrico leve", title_suggestion: "Patinete Elétrico Leve: Os Modelos Mais Fáceis de Carregar e Transportar", category: "guia-de-compra", priority: 7 },
  { keyword: "melhor scooter elétrica sem cnh 2026", title_suggestion: "Melhor Scooter Elétrica Sem CNH em 2026: Guia Completo", category: "guia-de-compra", priority: 9 },
  { keyword: "scooter elétrica para cidade", title_suggestion: "Scooter Elétrica para Cidade: O Que Considerar para Uso Urbano Diário", category: "guia-de-compra", priority: 8 },
  { keyword: "bicicleta elétrica ou scooter qual melhor", title_suggestion: "Bicicleta Elétrica ou Scooter Elétrica: Qual é Melhor para Você?", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico qual autonomia real", title_suggestion: "Autonomia Real de Patinete Elétrico: Por Que Difere do Anunciado pelo Fabricante", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico para mulher", title_suggestion: "Patinete Elétrico para Mulher: Leveza, Estabilidade e o Que Realmente Importa", category: "guia-de-compra", priority: 7 },
  { keyword: "patinete elétrico compacto", title_suggestion: "Patinete Elétrico Compacto: Melhores Opções para Quem Mora em Apartamento", category: "guia-de-compra", priority: 7 },
  { keyword: "quanto custa patinete elétrico bom", title_suggestion: "Quanto Custa um Patinete Elétrico Bom em 2026? Faixas de Preço Explicadas", category: "guia-de-compra", priority: 9 },
  { keyword: "patinete elétrico iniciante", title_suggestion: "Patinete Elétrico para Iniciante: Por Onde Começar sem Errar na Compra", category: "guia-de-compra", priority: 8 },
  { keyword: "melhor patinete elétrico até 2000 reais", title_suggestion: "Melhor Patinete Elétrico Até R$2.000: Opções que Valem o Dinheiro", category: "guia-de-compra", priority: 9 },
  { keyword: "melhor patinete elétrico até 3000 reais", title_suggestion: "Melhor Patinete Elétrico Até R$3.000: Vale Mais que os Básicos?", category: "guia-de-compra", priority: 8 },
  { keyword: "patinete elétrico usado vale a pena", title_suggestion: "Patinete Elétrico Usado Vale a Pena? O Que Verificar Antes de Comprar", category: "guia-de-compra", priority: 8 },
  { keyword: "como especificações técnicas patinete elétrico", title_suggestion: "Como Ler as Especificações de um Patinete Elétrico sem se Perder", category: "guia-de-compra", priority: 7 },

  // ─── MANUTENÇÃO (100) ──────────────────────────────────────────────────────
  { keyword: "manutenção patinete elétrico", title_suggestion: "Manutenção de Patinete Elétrico: Tudo o Que Você Precisa Saber", category: "manutencao", priority: 10 },
  { keyword: "como trocar pneu patinete elétrico", title_suggestion: "Como Trocar o Pneu de um Patinete Elétrico Passo a Passo", category: "manutencao", priority: 9 },
  { keyword: "bateria patinete elétrico não carrega", title_suggestion: "Bateria de Patinete Elétrico Não Carrega: 7 Causas e Como Resolver", category: "manutencao", priority: 10 },
  { keyword: "vida útil bateria patinete elétrico", title_suggestion: "Vida Útil da Bateria de Patinete Elétrico: Quanto Dura e Como Prolongar", category: "manutencao", priority: 9 },
  { keyword: "patinete elétrico não liga", title_suggestion: "Patinete Elétrico Não Liga: Diagnóstico Passo a Passo das Causas Mais Comuns", category: "manutencao", priority: 9 },
  { keyword: "como calibrar pneu patinete elétrico", title_suggestion: "Como Calibrar o Pneu de Patinete Elétrico: Pressão Certa para Cada Modelo", category: "manutencao", priority: 8 },
  { keyword: "checklist manutenção patinete elétrico", title_suggestion: "Checklist de Manutenção Mensal para Patinete Elétrico: 10 Pontos Para Verificar", category: "manutencao", priority: 9 },
  { keyword: "freio patinete elétrico não funciona", title_suggestion: "Freio de Patinete Elétrico Não Funciona Bem: Causas e Como Ajustar", category: "manutencao", priority: 9 },
  { keyword: "como lubrificar corrente patinete elétrico", title_suggestion: "Como Lubrificar a Corrente do Patinete Elétrico: Produto Certo e Frequência", category: "manutencao", priority: 7 },
  { keyword: "display patinete elétrico não funciona", title_suggestion: "Display do Patinete Elétrico Não Liga ou Exibe Erro: Como Resolver", category: "manutencao", priority: 8 },
  { keyword: "patinete elétrico perdeu velocidade", title_suggestion: "Patinete Elétrico Perdeu Velocidade: Por Que Acontece e Como Recuperar", category: "manutencao", priority: 8 },
  { keyword: "motor patinete elétrico fazendo barulho", title_suggestion: "Motor de Patinete Elétrico Fazendo Barulho: O Que Pode Ser e Como Resolver", category: "manutencao", priority: 8 },
  { keyword: "quanto custa revisão patinete elétrico", title_suggestion: "Quanto Custa uma Revisão de Patinete Elétrico? O Que Está Incluído", category: "manutencao", priority: 9 },
  { keyword: "patinete elétrico travado não acelera", title_suggestion: "Patinete Elétrico Travado ou Sem Aceleração: Diagnóstico e Solução", category: "manutencao", priority: 8 },
  { keyword: "como armazenar patinete elétrico", title_suggestion: "Como Armazenar Patinete Elétrico: Cuidados para Não Danificar a Bateria", category: "manutencao", priority: 7 },
  { keyword: "patinete elétrico pneu furo", title_suggestion: "Pneu de Patinete Elétrico Furou: Como Consertar ou Evitar Furos", category: "manutencao", priority: 8 },
  { keyword: "quanto tempo dura bateria patinete elétrico", title_suggestion: "Quanto Tempo Dura a Bateria de Patinete Elétrico? Ciclos, Anos e Dicas", category: "manutencao", priority: 9 },
  { keyword: "carregar bateria patinete elétrico corretamente", title_suggestion: "Como Carregar a Bateria do Patinete Elétrico do Jeito Certo", category: "manutencao", priority: 10 },
  { keyword: "erros ao carregar patinete elétrico", title_suggestion: "6 Erros ao Carregar a Bateria do Patinete Elétrico que Diminuem a Vida Útil", category: "manutencao", priority: 9 },
  { keyword: "patinete elétrico na chuva o que acontece", title_suggestion: "Patinete Elétrico na Chuva: O Que Pode Acontecer e Como Proteger", category: "manutencao", priority: 9 },
  { keyword: "pneu sólido vs câmara de ar patinete", title_suggestion: "Pneu Sólido vs Pneu com Câmara de Ar em Patinete Elétrico: Qual Escolher", category: "manutencao", priority: 8 },
  { keyword: "substituição bateria patinete elétrico", title_suggestion: "Quando e Como Substituir a Bateria do Patinete Elétrico", category: "manutencao", priority: 8 },
  { keyword: "descarte bateria patinete elétrico", title_suggestion: "Como Descartar a Bateria do Patinete Elétrico de Forma Correta no Brasil", category: "manutencao", priority: 7 },
  { keyword: "manutenção preventiva scooter elétrica", title_suggestion: "Manutenção Preventiva de Scooter Elétrica: O Que Fazer a Cada 500km", category: "manutencao", priority: 8 },
  { keyword: "controlador patinete elétrico queimado", title_suggestion: "Controlador de Patinete Elétrico Queimado: Sintomas e Como Trocar", category: "manutencao", priority: 7 },
  { keyword: "patinete elétrico dar choque", title_suggestion: "Patinete Elétrico Dando Choque: Causas Possíveis e O Que Fazer", category: "manutencao", priority: 8 },
  { keyword: "quanto tempo carregar patinete elétrico novo", title_suggestion: "Quanto Tempo Deixar Carregando o Patinete Elétrico Novo na Primeira Carga", category: "manutencao", priority: 8 },
  { keyword: "patinete elétrico esquentando demais", title_suggestion: "Patinete Elétrico Aquecendo Demais: Causas e Riscos de Superaquecimento", category: "manutencao", priority: 7 },
  { keyword: "revisão scooter elétrica quanto tempo", title_suggestion: "De Quanto em Quanto Tempo Fazer Revisão de Scooter Elétrica", category: "manutencao", priority: 7 },
  { keyword: "peças originais patinete elétrico importância", title_suggestion: "Por Que Usar Peças Originais no Patinete Elétrico Faz Diferença", category: "manutencao", priority: 8 },

  // ─── REGULAMENTAÇÃO (50) ───────────────────────────────────────────────────
  { keyword: "patinete elétrico precisa de cnh", title_suggestion: "Patinete Elétrico Precisa de CNH? A Lei Brasileira Explicada em 2026", category: "regulamentacao", priority: 10 },
  { keyword: "scooter elétrica precisa de cnh", title_suggestion: "Scooter Elétrica Precisa de CNH? Entenda a Diferença Entre os Tipos", category: "regulamentacao", priority: 10 },
  { keyword: "resolução contran 996 2023 patinete", title_suggestion: "Resolução CONTRAN 996/2023: O Que Mudou para Patinetes e Scooters Elétricos", category: "regulamentacao", priority: 10 },
  { keyword: "onde pode andar patinete elétrico", title_suggestion: "Onde Pode Andar de Patinete Elétrico? Vias, Velocidades e Restrições", category: "regulamentacao", priority: 10 },
  { keyword: "velocidade máxima patinete elétrico lei", title_suggestion: "Velocidade Máxima Permitida para Patinete Elétrico: O Que Diz a Lei", category: "regulamentacao", priority: 9 },
  { keyword: "patinete elétrico pode andar na calçada", title_suggestion: "Patinete Elétrico Pode Andar na Calçada? A Lei é Clara sobre Isso", category: "regulamentacao", priority: 9 },
  { keyword: "patinete elétrico precisa de emplacamento 2026", title_suggestion: "Patinete Elétrico Precisa de Emplacamento em 2026? O Que Mudou", category: "regulamentacao", priority: 9 },
  { keyword: "autopropelido o que é", title_suggestion: "O Que é um Veículo Autopropelido? Diferença para Ciclomotor e Patinete", category: "regulamentacao", priority: 9 },
  { keyword: "equipamentos obrigatórios patinete elétrico", title_suggestion: "Equipamentos Obrigatórios para Andar de Patinete Elétrico Legalmente", category: "regulamentacao", priority: 9 },
  { keyword: "multa patinete elétrico sem cnh", title_suggestion: "Patinete Elétrico Sem CNH: Quando é Infração e Qual a Multa", category: "regulamentacao", priority: 8 },
  { keyword: "seguro patinete elétrico obrigatório", title_suggestion: "Seguro para Patinete Elétrico: É Obrigatório? Como Contratar", category: "regulamentacao", priority: 8 },
  { keyword: "patinete elétrico pode andar na ciclovia", title_suggestion: "Patinete Elétrico Pode Usar Ciclovia? Velocidade Máxima e Regras", category: "regulamentacao", priority: 9 },
  { keyword: "legislação scooter elétrica brasil 2026", title_suggestion: "Legislação de Scooter Elétrica no Brasil em 2026: Guia Atualizado", category: "regulamentacao", priority: 9 },
  { keyword: "registro patinete elétrico detran", title_suggestion: "Precisa Registrar Patinete Elétrico no DETRAN? Tire Essa Dúvida", category: "regulamentacao", priority: 8 },
  { keyword: "capacete obrigatório patinete elétrico", title_suggestion: "Capacete é Obrigatório para Patinete Elétrico? Lei Federal Explicada", category: "regulamentacao", priority: 9 },
  { keyword: "regulamentação patinete elétrico maringá", title_suggestion: "Regulamentação de Patinete Elétrico em Maringá: Regras Municipais e Ciclovias", category: "regulamentacao", priority: 10 },
  { keyword: "limite potência patinete elétrico lei", title_suggestion: "Potência Máxima Permitida em Patinete Elétrico pela Lei Brasileira", category: "regulamentacao", priority: 8 },
  { keyword: "patinete elétrico passageiro na garupa", title_suggestion: "Pode Levar Passageiro na Garupa do Patinete Elétrico? O Que Diz a Lei", category: "regulamentacao", priority: 7 },

  // ─── ECONOMIA (40) ─────────────────────────────────────────────────────────
  { keyword: "quanto custa manter patinete elétrico por mês", title_suggestion: "Quanto Custa Manter um Patinete Elétrico por Mês: Conta Detalhada", category: "economia", priority: 10 },
  { keyword: "patinete elétrico vs carro custo", title_suggestion: "Patinete Elétrico vs Carro: Comparativo de Custo por Km Real", category: "economia", priority: 9 },
  { keyword: "patinete elétrico vs moto custo", title_suggestion: "Patinete Elétrico vs Moto a Gasolina: Quem Gasta Menos por Mês", category: "economia", priority: 9 },
  { keyword: "quanto custa carregar bateria patinete elétrico", title_suggestion: "Quanto Custa Carregar a Bateria de um Patinete Elétrico na Conta de Luz", category: "economia", priority: 10 },
  { keyword: "em quanto tempo patinete elétrico se paga", title_suggestion: "Em Quanto Tempo um Patinete Elétrico se Paga? Conta com Números Reais", category: "economia", priority: 9 },
  { keyword: "economia patinete elétrico transporte urbano", title_suggestion: "Quanto Você Economiza Usando Patinete Elétrico no Lugar do Transporte Público", category: "economia", priority: 8 },
  { keyword: "custo por km patinete elétrico", title_suggestion: "Custo por Km de Patinete Elétrico: Como Calcular e Comparar", category: "economia", priority: 9 },
  { keyword: "financiamento patinete elétrico", title_suggestion: "Como Financiar um Patinete Elétrico: Opções de Parcelamento e Crédito", category: "economia", priority: 8 },
  { keyword: "patinete elétrico vale a pena 2026", title_suggestion: "Patinete Elétrico Vale a Pena em 2026? Análise Honesta de Custo x Benefício", category: "economia", priority: 10 },
  { keyword: "depreciação patinete elétrico revenda", title_suggestion: "Quanto Deprecia um Patinete Elétrico? O Que Considerar para Revenda", category: "economia", priority: 7 },
  { keyword: "scooter elétrica economiza quanto por mês", title_suggestion: "Scooter Elétrica Economiza Quanto por Mês Comparado à Moto a Gasolina?", category: "economia", priority: 9 },
  { keyword: "patinete elétrico para economizar gasolina", title_suggestion: "Usar Patinete Elétrico para Economizar Gasolina: Quanto Você Realmente Poupa", category: "economia", priority: 8 },

  // ─── SEGURANÇA (40) ────────────────────────────────────────────────────────
  { keyword: "equipamentos de segurança patinete elétrico", title_suggestion: "Equipamentos de Segurança Indispensáveis para Andar de Patinete Elétrico", category: "seguranca", priority: 9 },
  { keyword: "melhor capacete para patinete elétrico", title_suggestion: "Melhor Capacete para Patinete Elétrico: Tipos, Segurança e Preço", category: "seguranca", priority: 9 },
  { keyword: "como andar de patinete elétrico com segurança", title_suggestion: "Como Andar de Patinete Elétrico com Segurança no Trânsito Urbano", category: "seguranca", priority: 9 },
  { keyword: "patinete elétrico risco de acidente", title_suggestion: "Riscos de Acidente com Patinete Elétrico e Como Reduzi-los", category: "seguranca", priority: 8 },
  { keyword: "como proteger patinete elétrico de roubo", title_suggestion: "Como Proteger seu Patinete Elétrico de Roubos e Furtos", category: "seguranca", priority: 8 },
  { keyword: "joelheira cotoveleira patinete elétrico", title_suggestion: "Joelheiras e Cotoveleiras para Patinete: Vale o Investimento em Proteção?", category: "seguranca", priority: 7 },
  { keyword: "patinete elétrico à noite segurança", title_suggestion: "Andar de Patinete Elétrico à Noite: Equipamentos e Cuidados Essenciais", category: "seguranca", priority: 8 },
  { keyword: "patinete elétrico chuva riscos", title_suggestion: "Riscos de Andar de Patinete Elétrico na Chuva e Como se Proteger", category: "seguranca", priority: 8 },
  { keyword: "rastreador patinete elétrico", title_suggestion: "Rastreador para Patinete Elétrico: Opções e Qual Vale a Pena Instalar", category: "seguranca", priority: 7 },
  { keyword: "frenagem patinete elétrico técnica", title_suggestion: "Técnica de Frenagem Correta no Patinete Elétrico para Evitar Acidentes", category: "seguranca", priority: 7 },
  { keyword: "seguro patinete elétrico roubou", title_suggestion: "Seguro para Patinete Elétrico Contra Roubo: Como Contratar e O Que Cobre", category: "seguranca", priority: 8 },
  { keyword: "patinete elétrico seguro para usar no trabalho", title_suggestion: "Patinete Elétrico é Seguro para Ir ao Trabalho Todos os Dias?", category: "seguranca", priority: 8 },

  // ─── HIPERLOCAL — MARINGÁ E REGIÃO (60) ───────────────────────────────────
  { keyword: "patinete elétrico maringá", title_suggestion: "Patinete Elétrico em Maringá: Ciclovias, Regras e Onde Comprar", category: "hiperlocal", priority: 10 },
  { keyword: "manutenção patinete elétrico maringá", title_suggestion: "Manutenção de Patinete Elétrico em Maringá: Oficina Especializada", category: "hiperlocal", priority: 10 },
  { keyword: "onde comprar patinete elétrico maringá", title_suggestion: "Onde Comprar Patinete Elétrico em Maringá: Loja Física com Assistência Técnica", category: "hiperlocal", priority: 10 },
  { keyword: "ciclovias maringá patinete", title_suggestion: "Ciclovias de Maringá para Patinete Elétrico: Mapa e Dicas de Uso", category: "hiperlocal", priority: 9 },
  { keyword: "scooter elétrica maringá", title_suggestion: "Scooter Elétrica em Maringá: Onde Comprar, Testar e Fazer Manutenção", category: "hiperlocal", priority: 10 },
  { keyword: "oficina patinete elétrico maringá", title_suggestion: "Oficina de Patinete Elétrico em Maringá: Serviços, Peças e Atendimento", category: "hiperlocal", priority: 10 },
  { keyword: "loja patinete elétrico maringá", title_suggestion: "Loja de Patinete Elétrico em Maringá: 6 Anos de Experiência e +3000 Clientes", category: "hiperlocal", priority: 10 },
  { keyword: "bicicleta elétrica maringá", title_suggestion: "Bicicleta Elétrica em Maringá: Onde Comprar e Fazer Manutenção", category: "hiperlocal", priority: 9 },
  { keyword: "mobilidade elétrica maringá", title_suggestion: "Mobilidade Elétrica em Maringá: Patinetes, Scooters e Bikes no Dia a Dia", category: "hiperlocal", priority: 8 },
  { keyword: "patinete elétrico londrina", title_suggestion: "Patinete Elétrico em Londrina: Ciclovias, Regras e Onde Comprar", category: "hiperlocal", priority: 8 },
  { keyword: "patinete elétrico curitiba", title_suggestion: "Patinete Elétrico em Curitiba: Infraestrutura, Regulamentação e Dicas", category: "hiperlocal", priority: 8 },
  { keyword: "patinete elétrico são paulo", title_suggestion: "Patinete Elétrico em São Paulo: Regras, Ciclovias e Como Usar no Trânsito", category: "hiperlocal", priority: 8 },
  { keyword: "patinete elétrico paraná regulamentação", title_suggestion: "Regulamentação de Patinete Elétrico no Paraná: O Que Todo Usuário Deve Saber", category: "hiperlocal", priority: 9 },
  { keyword: "assistência técnica patinete elétrico maringá", title_suggestion: "Assistência Técnica de Patinete Elétrico em Maringá: Serviço Especializado", category: "hiperlocal", priority: 10 },
  { keyword: "entrega patinete elétrico maringá domicílio", title_suggestion: "Entrega de Patinete Elétrico em Maringá: Compre e Receba em Casa", category: "hiperlocal", priority: 9 },
  { keyword: "peças patinete elétrico maringá", title_suggestion: "Peças para Patinete Elétrico em Maringá: Originais com Entrega Rápida", category: "hiperlocal", priority: 9 },
  { keyword: "test drive patinete elétrico maringá", title_suggestion: "Test Drive de Patinete Elétrico em Maringá: Experimente Antes de Comprar", category: "hiperlocal", priority: 8 },
  { keyword: "melhor loja patinete elétrico maringá", title_suggestion: "Melhor Loja de Patinete Elétrico em Maringá: Por Que a Patinep Store Lidera", category: "hiperlocal", priority: 10 },

  // ─── DELIVERY (40) ─────────────────────────────────────────────────────────
  { keyword: "melhor patinete elétrico para delivery 2026", title_suggestion: "Melhor Patinete Elétrico para Delivery em 2026: Durabilidade e Autonomia", category: "delivery", priority: 10 },
  { keyword: "patinete elétrico para ifood vale a pena", title_suggestion: "Patinete Elétrico para iFood Vale a Pena? Análise Real de Quem Entrega", category: "delivery", priority: 10 },
  { keyword: "scooter elétrica para delivery", title_suggestion: "Scooter Elétrica para Delivery: Melhor que Moto a Gasolina?", category: "delivery", priority: 9 },
  { keyword: "quantos km patinete elétrico faz por dia delivery", title_suggestion: "Quantos Km um Patinete Elétrico Aguenta por Dia no Delivery?", category: "delivery", priority: 9 },
  { keyword: "custo delivery patinete elétrico vs moto", title_suggestion: "Delivery de Patinete Elétrico vs Moto: Comparativo de Custo Mensal Real", category: "delivery", priority: 10 },
  { keyword: "baú patinete elétrico delivery", title_suggestion: "Baú e Caixas para Patinete Elétrico no Delivery: Modelos e Como Instalar", category: "delivery", priority: 8 },
  { keyword: "manutenção patinete elétrico delivery intenso uso", title_suggestion: "Manutenção de Patinete Elétrico com Uso Intenso no Delivery", category: "delivery", priority: 9 },
  { keyword: "patinete elétrico rappi uber eats", title_suggestion: "Patinete Elétrico nos Apps de Delivery: Funciona para Rappi e Uber Eats?", category: "delivery", priority: 9 },
  { keyword: "quanto ganha entregador de patinete elétrico", title_suggestion: "Quanto Ganha um Entregador que Usa Patinete Elétrico? Conta Completa", category: "delivery", priority: 8 },
  { keyword: "patinete elétrico última milha logística", title_suggestion: "Patinete Elétrico na Logística de Última Milha: Eficiência e Economia", category: "delivery", priority: 7 },
  { keyword: "seguro patinete elétrico delivery", title_suggestion: "Seguro para Patinete Elétrico no Delivery: O Que Cobrir e Quanto Custa", category: "delivery", priority: 8 },
  { keyword: "foston para delivery qual modelo", title_suggestion: "Qual Modelo de Patinete Foston é Melhor para Delivery? Comparativo", category: "delivery", priority: 9 },

  // ─── FAQ / PERGUNTAS FREQUENTES (80) ──────────────────────────────────────
  { keyword: "patinete elétrico aguenta chuva", title_suggestion: "Patinete Elétrico Aguenta Chuva? Grau de Proteção IP Explicado", category: "faq", priority: 10 },
  { keyword: "patinete elétrico pode subir morro", title_suggestion: "Patinete Elétrico Consegue Subir Morro? Depende Desses Fatores", category: "faq", priority: 9 },
  { keyword: "quanto tempo demora carregar patinete elétrico", title_suggestion: "Quanto Tempo Demora para Carregar um Patinete Elétrico Completamente", category: "faq", priority: 10 },
  { keyword: "patinete elétrico velocidade máxima real", title_suggestion: "Velocidade Máxima Real de Patinete Elétrico: Por Que Difere do Anunciado", category: "faq", priority: 9 },
  { keyword: "posso deixar patinete elétrico carregando a noite toda", title_suggestion: "Posso Deixar o Patinete Elétrico Carregando a Noite Toda?", category: "faq", priority: 9 },
  { keyword: "patinete elétrico perde autonomia no frio", title_suggestion: "Patinete Elétrico Perde Autonomia no Frio? Entenda o Impacto da Temperatura", category: "faq", priority: 8 },
  { keyword: "patinete elétrico pode transportar avião", title_suggestion: "Patinete Elétrico Pode Transportar em Avião? Regras das Companhias Aéreas", category: "faq", priority: 7 },
  { keyword: "quanto pesa patinete elétrico", title_suggestion: "Quanto Pesa um Patinete Elétrico? Referência por Porte e Potência", category: "faq", priority: 8 },
  { keyword: "patinete elétrico 2 pessoas", title_suggestion: "Patinete Elétrico Para Duas Pessoas: É Possível? Riscos e Alternativas", category: "faq", priority: 8 },
  { keyword: "scooter elétrica dá muito problema", title_suggestion: "Scooter Elétrica Dá Muito Problema? A Realidade de Quem Usa no Dia a Dia", category: "faq", priority: 9 },
  { keyword: "patinete elétrico dura quantos anos", title_suggestion: "Patinete Elétrico Dura Quantos Anos? Expectativa Real de Vida Útil", category: "faq", priority: 9 },
  { keyword: "diferença patinete elétrico scooter elétrica", title_suggestion: "Qual a Diferença entre Patinete Elétrico e Scooter Elétrica?", category: "faq", priority: 9 },
  { keyword: "patinete elétrico consome muita energia", title_suggestion: "Patinete Elétrico Consome Muita Energia? Comparativo com Outros Veículos", category: "faq", priority: 8 },
  { keyword: "garantia patinete elétrico brasil", title_suggestion: "Garantia de Patinete Elétrico no Brasil: O Que Cobre e Por Quanto Tempo", category: "faq", priority: 9 },
  { keyword: "foston tem boa qualidade", title_suggestion: "Foston tem Boa Qualidade? Avaliação de Quem Vende e Conserta", category: "faq", priority: 9 },
  { keyword: "patinete elétrico para longas distâncias", title_suggestion: "Patinete Elétrico Serve para Longas Distâncias? Limitações Reais", category: "faq", priority: 8 },
  { keyword: "como saber se patinete elétrico está com defeito", title_suggestion: "Como Saber se Meu Patinete Elétrico Está com Defeito: Sinais de Alerta", category: "faq", priority: 8 },
  { keyword: "patinete elétrico para criança ou adulto diferença", title_suggestion: "Patinete Elétrico Infantil vs Adulto: Quais São as Diferenças?", category: "faq", priority: 7 },
  { keyword: "vale a pena comprar patinete elétrico na internet", title_suggestion: "Vale a Pena Comprar Patinete Elétrico pela Internet? Riscos e Cuidados", category: "faq", priority: 9 },
  { keyword: "patinete elétrico trava em curva", title_suggestion: "Patinete Elétrico Trava em Curva: O Que Pode Ser e Como Evitar", category: "faq", priority: 7 },
  { keyword: "como saber carga bateria patinete elétrico", title_suggestion: "Como Verificar a Carga da Bateria do Patinete Elétrico com Precisão", category: "faq", priority: 8 },
  { keyword: "patinete elétrico serve para calçada de paralelepípedo", title_suggestion: "Patinete Elétrico em Paralelepípedo: Funciona? Tipos de Pneu que Ajudam", category: "faq", priority: 8 },

  // ─── TÉCNICO (30) ──────────────────────────────────────────────────────────
  { keyword: "o que é bms patinete elétrico", title_suggestion: "O Que é BMS em Patinetes Elétricos: Sistema de Gerenciamento de Bateria Explicado", category: "tecnico", priority: 8 },
  { keyword: "motor hub patinete elétrico", title_suggestion: "Motor Hub em Patinete Elétrico: Vantagens, Desvantagens e Como Funciona", category: "tecnico", priority: 7 },
  { keyword: "controlador patinete elétrico função", title_suggestion: "Controlador de Patinete Elétrico: O Que É e Por Que É o Coração do Veículo", category: "tecnico", priority: 7 },
  { keyword: "bateria lítio patinete elétrico tipos", title_suggestion: "Tipos de Bateria de Lítio em Patinetes: Li-Ion vs LiFePO4 — Qual é Melhor", category: "tecnico", priority: 8 },
  { keyword: "freio a disco vs freio tambor patinete", title_suggestion: "Freio a Disco vs Freio Tambor em Patinete Elétrico: Qual Freia Melhor", category: "tecnico", priority: 8 },
  { keyword: "sistema de regeneração energia patinete", title_suggestion: "Freio Regenerativo em Patinete Elétrico: Como Funciona e Quanto Economiza", category: "tecnico", priority: 7 },
  { keyword: "ip54 ip65 patinete elétrico diferença", title_suggestion: "IP54 vs IP65 em Patinete Elétrico: O Que Significa e Qual Escolher", category: "tecnico", priority: 8 },
  { keyword: "torque motor patinete elétrico importância", title_suggestion: "Torque do Motor de Patinete Elétrico: Por Que É Mais Importante que a Potência", category: "tecnico", priority: 7 },
  { keyword: "suspensão patinete elétrico tipos", title_suggestion: "Tipos de Suspensão em Patinete Elétrico: Com ou Sem Suspensão — Qual Importa", category: "tecnico", priority: 7 },
  { keyword: "wattage hora bateria patinete cálculo", title_suggestion: "Wh (Watt-hora) de Bateria de Patinete: Como Calcular a Autonomia Real", category: "tecnico", priority: 8 },

  // ─── LIFESTYLE (70) ────────────────────────────────────────────────────────
  { keyword: "usar patinete elétrico no trabalho", title_suggestion: "Usar Patinete Elétrico para Ir ao Trabalho: Dicas de Quem Já Adotou", category: "lifestyle", priority: 10 },
  { keyword: "rotina de quem usa patinete elétrico todo dia", title_suggestion: "A Rotina de Quem Usa Patinete Elétrico Todos os Dias: Relato Real", category: "lifestyle", priority: 9 },
  { keyword: "acessórios indispensáveis patinete elétrico", title_suggestion: "10 Acessórios Indispensáveis para Quem Usa Patinete Elétrico no Dia a Dia", category: "lifestyle", priority: 9 },
  { keyword: "como transportar patinete elétrico carro", title_suggestion: "Como Transportar Patinete Elétrico no Carro: Suportes e Soluções", category: "lifestyle", priority: 7 },
  { keyword: "patinete elétrico para fazer exercício", title_suggestion: "Patinete Elétrico Conta como Exercício? Calorias e Benefícios Físicos", category: "lifestyle", priority: 7 },
  { keyword: "como guardar patinete elétrico apartamento", title_suggestion: "Como Guardar Patinete Elétrico no Apartamento sem Ocupar Espaço", category: "lifestyle", priority: 8 },
  { keyword: "viajar com patinete elétrico dicas", title_suggestion: "Viajar com Patinete Elétrico: Dicas para Levar em Trips e Viagens", category: "lifestyle", priority: 7 },
  { keyword: "patinete elétrico impacto no meio ambiente", title_suggestion: "Patinete Elétrico e Meio Ambiente: É Realmente Sustentável?", category: "lifestyle", priority: 7 },
  { keyword: "comunidade patinete elétrico brasil", title_suggestion: "Comunidades de Patinete Elétrico no Brasil: Grupos e Onde se Conectar", category: "lifestyle", priority: 6 },
  { keyword: "patinete elétrico para idosos", title_suggestion: "Patinete Elétrico para Idosos: Segurança, Modelos Indicados e Cuidados", category: "lifestyle", priority: 7 },
  { keyword: "usar patinete elétrico no inverno", title_suggestion: "Como Usar Patinete Elétrico no Inverno: Cuidados com Frio e Chuva", category: "lifestyle", priority: 7 },
  { keyword: "patinete elétrico para mobilidade reduzida", title_suggestion: "Patinete Elétrico para Pessoas com Mobilidade Reduzida: Opções e Adaptações", category: "lifestyle", priority: 7 },
  { keyword: "como aprender andar de patinete elétrico", title_suggestion: "Como Aprender a Andar de Patinete Elétrico: Dicas para Nunca Ter Rodado Antes", category: "lifestyle", priority: 8 },
  { keyword: "patinete elétrico clube de usuários maringá", title_suggestion: "Usuários de Patinete Elétrico em Maringá: Como É a Comunidade Local", category: "lifestyle", priority: 7 },
  { keyword: "presente patinete elétrico para pai filho", title_suggestion: "Patinete Elétrico como Presente: Para Quem Indica e Qual Modelo Escolher", category: "lifestyle", priority: 7 },
];

async function seed() {
  console.log(`Iniciando seed com ${topics.length} tópicos...`);

  // Verifica duplicatas por keyword
  const { data: existing } = await supabase
    .from("blog_topics")
    .select("keyword");

  const existingKeywords = new Set((existing || []).map((r: { keyword: string }) => r.keyword));
  const novos = topics.filter((t) => !existingKeywords.has(t.keyword));

  if (novos.length === 0) {
    console.log("Todos os tópicos já estão cadastrados.");
    return;
  }

  // Insere em lotes de 50
  const BATCH = 50;
  let inseridos = 0;

  for (let i = 0; i < novos.length; i += BATCH) {
    const batch = novos.slice(i, i + BATCH);
    const { error } = await supabase.from("blog_topics").insert(batch);
    if (error) {
      console.error(`Erro no lote ${i / BATCH + 1}:`, error.message);
    } else {
      inseridos += batch.length;
      console.log(`Lote ${i / BATCH + 1}: ${batch.length} tópicos inseridos`);
    }
  }

  console.log(`\nConcluído! ${inseridos} tópicos inseridos. ${existingKeywords.size} já existiam.`);
}

seed().catch(console.error);

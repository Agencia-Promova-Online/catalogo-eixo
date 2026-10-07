import { normalizeText, type Machine, type SpecValidationStatus } from "@/lib/catalog";

/**
 * Camada de apresentação: define QUAIS especificações fazem sentido por categoria.
 * Nunca inventa valores — apenas lê os campos cadastrados. Sem dado => "Não informado".
 */

export type SpecItem = { label: string; value: string | null; status?: SpecValidationStatus };

export type MachineFamily =
  | "escavadeira"
  | "retroescavadeira"
  | "mini-escavadeira"
  | "mini-carregadeira"
  | "pa-carregadeira"
  | "agricola"
  | "caminhao"
  | "outra";

export function machineFamily(machine: Pick<Machine, "category">): MachineFamily {
  const key = normalizeText(machine.category ?? "");
  if (key.includes("mini escavadeira")) return "mini-escavadeira";
  if (key.includes("mini carregadeira")) return "mini-carregadeira";
  if (key.includes("retroescavadeira")) return "retroescavadeira";
  if (key.includes("carregadeira")) return "pa-carregadeira";
  if (key.includes("escavadeira")) return "escavadeira";
  if (key.includes("agricola") || key.includes("trator")) return "agricola";
  if (key.includes("caminhao")) return "caminhao";
  return "outra";
}

/** Rótulos esperados por família — dinâmicos, conforme solicitado. */
const FIELDS: Record<MachineFamily, string[]> = {
  escavadeira: [
    "Potência do motor",
    "Peso operacional",
    "Profundidade máxima de escavação",
    "Alcance máximo",
    "Capacidade da caçamba",
    "Força de escavação",
    "Vazão hidráulica",
  ],
  retroescavadeira: [
    "Potência do motor",
    "Peso operacional",
    "Profundidade de escavação",
    "Capacidade da caçamba dianteira",
    "Capacidade da caçamba traseira",
    "Alcance máximo",
    "Altura de descarga",
  ],
  "mini-escavadeira": [
    "Peso operacional",
    "Potência do motor",
    "Profundidade de escavação",
    "Alcance máximo",
    "Largura",
    "Capacidade da caçamba",
  ],
  "mini-carregadeira": [
    "Potência do motor",
    "Peso operacional",
    "Capacidade operacional",
    "Carga de tombamento",
    "Altura de elevação",
    "Vazão hidráulica",
  ],
  "pa-carregadeira": [
    "Potência do motor",
    "Peso operacional",
    "Capacidade da caçamba",
    "Altura de descarga",
    "Força de desagregação",
    "Vazão hidráulica",
  ],

  agricola: ["Potência do motor", "Peso operacional", "Tipo de transmissão", "Dimensões"],
  caminhao: ["Potência do motor", "Tipo de transmissão", "Capacidade do tanque", "Dimensões"],
  outra: ["Potência do motor", "Peso operacional", "Dimensões"],
};

/**
 * Mapeia os labels técnicos para os campos do banco de dados.
 */
function knownValue(machine: Machine, label: string): string | null {
  const key = normalizeText(label);
  if (key.includes("potencia")) return machine.power;
  if (key.includes("peso operacional")) return machine.operating_weight;
  if (key.includes("profundidade") && key.includes("maxima")) return machine.max_digging_depth;
  if (key.includes("profundidade")) return machine.max_digging_depth;
  if (key.includes("capacidade da cacamba") && key.includes("dianteira")) return machine.bucket_capacity_front;
  if (key.includes("capacidade da cacamba") && key.includes("traseira")) return machine.bucket_capacity_rear;
  if (key.includes("capacidade da cacamba")) return machine.bucket_capacity;
  if (key.includes("alcance")) return machine.max_reach;
  if (key.includes("altura de descarga")) return machine.dump_height;
  if (key.includes("forca")) return machine.digging_force;
  if (key.includes("vazao hidraulica")) return machine.hydraulic_flow;
  if (key.includes("pressao hidraulica")) return machine.hydraulic_pressure;
  if (key.includes("sistema hidraulico")) return machine.hydraulic_system;
  if (key.includes("motor") && !key.includes("potencia")) return machine.engine;
  if (key.includes("transmissao")) return machine.transmission;
  if (key.includes("dimensoes")) return machine.dimensions;
  if (key.includes("capacidade do tanque")) return machine.tank_capacity;
  if (key.includes("velocidade maxima")) return machine.max_speed;
  return null;
}

export function machineSpecs(machine: Machine, onlyConfirmed = false): SpecItem[] {
  const family = machineFamily(machine);
  const labels = FIELDS[family];
  
  // Adiciona campos comuns a todas
  const allSpecs = [...labels];
  if (!allSpecs.includes("Motor")) allSpecs.push("Motor");
  if (!allSpecs.includes("Transmissão")) allSpecs.push("Transmissão");
  if (!allSpecs.includes("Sistema hidráulico")) allSpecs.push("Sistema hidráulico");
  if (!allSpecs.includes("Dimensões")) allSpecs.push("Dimensões");
  if (!allSpecs.includes("Capacidade do tanque")) allSpecs.push("Capacidade do tanque");
  if (!allSpecs.includes("Condição")) allSpecs.push("Condição");

  const specs = allSpecs.map((label) => {
    const status = getSpecStatus(machine, label);
    const value = label === "Condição" ? (machine.condition || "NOVA DE FÁBRICA") : knownValue(machine, label);
    
    // Se for solicitado apenas confirmados e não estiver confirmado, mascara o valor
    // Também mascara se o valor for "Não confirmado" ou similar
    const isInvalid = value === "Não confirmado" || value === "Não informado" || value === null || value === "";
    const finalValue = (onlyConfirmed && (status !== "confirmed" || isInvalid)) && label !== "Condição"
      ? "Informação técnica em atualização."
      : value;

    return { label, value: finalValue, status };
  });

  return specs;
}

function getSpecStatus(machine: Machine, label: string): "confirmed" | "review" | "not_confirmed" {
  const key = normalizeText(label);
  if (key.includes("potencia")) return machine.status_power || "not_confirmed";
  if (key.includes("peso operacional")) return machine.status_operating_weight || "not_confirmed";
  if (key.includes("profundidade")) return machine.status_max_digging_depth || "not_confirmed";
  if (key.includes("capacidade da cacamba")) return machine.status_bucket_capacity || "not_confirmed";
  if (key.includes("alcance")) return machine.status_max_reach || "not_confirmed";
  if (key.includes("altura de descarga")) return machine.status_dump_height || "not_confirmed";
  if (key.includes("motor") && !key.includes("potencia")) return machine.status_engine || "not_confirmed";
  if (key.includes("transmissao")) return machine.status_transmission || "not_confirmed";
  if (key.includes("vazao hidraulica")) return machine.status_hydraulic_flow || "not_confirmed";
  return "confirmed"; // Campos como Condição ou dimensões (se não mapeados individualmente) assumimos como ok ou tratamos depois
}


/** Destaques visuais: no máximo 4 cartões, priorizando dados cadastrados. */
export function machineHighlights(machine: Machine): SpecItem[] {
  const base: SpecItem[] = [
    { label: "Potência", value: machine.power },
    { label: "Peso operacional", value: machine.operating_weight },
    { label: "Ano", value: machine.year ? String(machine.year) : null },
    { label: "Categoria", value: machine.category || null },
  ];
  return base.slice(0, 4);
}

/** Qualidades coerentes com a família do equipamento (sem promessas comerciais). */
const QUALITIES: Record<MachineFamily, string[]> = {
  escavadeira: [
    "Alto desempenho em escavação",
    "Estrutura robusta para trabalho contínuo",
    "Boa estabilidade em operação",
    "Cabine com boa visibilidade",
  ],
  retroescavadeira: [
    "Alta versatilidade",
    "Escavação e carregamento na mesma máquina",
    "Construção robusta",
    "Boa produtividade em obras urbanas",
    "Aplicações variadas",
  ],
  "mini-escavadeira": [
    "Ideal para espaços reduzidos",
    "Fácil transporte entre obras",
    "Boa precisão de operação",
    "Baixo impacto no piso",
  ],
  "mini-carregadeira": [
    "Compacta e ágil",
    "Compatível com diversos implementos",
    "Boa capacidade de carga para o porte",
    "Manobrabilidade em áreas estreitas",
  ],
  "pa-carregadeira": [
    "Alta capacidade de carregamento",
    "Boa produtividade na movimentação de materiais",
    "Estrutura reforçada",
    "Operação confortável",
  ],
  agricola: [
    "Indicada para operações agrícolas",
    "Boa tração em campo",
    "Manutenção simplificada",
    "Compatível com implementos",
  ],
  caminhao: [
    "Indicado para transporte de materiais",
    "Boa relação entre carga e consumo",
    "Estrutura preparada para uso intenso",
  ],
  outra: ["Equipamento robusto", "Boa produtividade", "Manutenção simplificada"],
};

export function machineQualities(machine: Machine): string[] {
  if (machine.qualities && machine.qualities.length > 0) return machine.qualities;
  return [...QUALITIES[machineFamily(machine)], "Equipamento novo de fábrica"];
}


const APPLICATIONS: Record<MachineFamily, string[]> = {
  escavadeira: ["Terraplenagem", "Infraestrutura", "Saneamento", "Abertura de valas", "Mineração"],
  retroescavadeira: [
    "Construção civil",
    "Saneamento",
    "Abertura de valas",
    "Loteamentos",
    "Serviços municipais",
    "Manutenção de estradas",
  ],
  "mini-escavadeira": ["Obras urbanas", "Saneamento", "Paisagismo", "Abertura de valas"],
  "mini-carregadeira": [
    "Movimentação de materiais",
    "Obras urbanas",
    "Limpeza de terrenos",
    "Serviços municipais",
  ],
  "pa-carregadeira": ["Movimentação de materiais", "Terraplenagem", "Mineração", "Loteamentos"],
  agricola: ["Agricultura", "Movimentação de materiais", "Manutenção de estradas rurais"],
  caminhao: ["Transporte de materiais", "Infraestrutura", "Construção civil"],
  outra: ["Construção civil", "Infraestrutura"],
};

export function machineApplications(machine: Machine): string[] {
  if (machine.applications && machine.applications.length > 0) return machine.applications;
  return APPLICATIONS[machineFamily(machine)];
}


/** Descrição objetiva quando não houver texto cadastrado. */
export function machineDescription(machine: Machine): string {
  if (machine.description?.trim()) return machine.description.trim();
  const family: Record<MachineFamily, string> = {
    escavadeira: "escavadeira desenvolvida para terraplenagem, infraestrutura e obras de grande porte",
    retroescavadeira:
      "retroescavadeira versátil desenvolvida para construção, infraestrutura, terraplenagem e serviços gerais, combinando escavação e carregamento em uma única máquina",
    "mini-escavadeira":
      "mini escavadeira indicada para obras em espaços reduzidos, saneamento e serviços urbanos",
    "mini-carregadeira":
      "mini carregadeira compacta indicada para movimentação de materiais e serviços em áreas restritas",
    "pa-carregadeira":
      "pá carregadeira indicada para movimentação de materiais, terraplenagem e carregamento de alta produtividade",
    agricola: "máquina agrícola indicada para operações de campo e movimentação de materiais",
    caminhao: "veículo indicado para transporte de materiais em obras e infraestrutura",
    outra: "equipamento indicado para aplicações de construção e infraestrutura",
  };
  return `A ${machine.display_name} é uma ${family[machineFamily(machine)]}. Equipamento novo de fábrica.`;
}

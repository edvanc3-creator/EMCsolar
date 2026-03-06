import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  products: string;
  terms: string;
  createdAt: number;
}

export interface ServiceItem {
  id: string;
  category: 'solar' | 'elec_lighting' | 'elec_point' | 'elec_panel' | 'elec_cables' | 'elec_troubleshoot' | 'elec_entry' | 'elec_ev' | 'elec_automation';
  description: string;
  unit: string;
  basePrice: number;
}

export interface BudgetService {
  serviceId: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Budget {
  id: string;
  customerId: string;
  services: BudgetService[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'completed';
  createdAt: number;
  geo?: {
    lat: number;
    lng: number;
  };
  signature?: string; // base64
  photos?: string[]; // base64 or urls
}

export const PREDEFINED_SERVICES: ServiceItem[] = [
  // SOLAR
  { id: 'sol_01', category: 'solar', description: 'Instalação de Painéis Solares (até 5kW)', unit: 'unid', basePrice: 2500 },
  { id: 'sol_02', category: 'solar', description: 'Instalação de Inversor', unit: 'unid', basePrice: 800 },
  { id: 'sol_03', category: 'solar', description: 'Limpeza de Painéis', unit: 'unid', basePrice: 150 },
  
  // ILUMINAÇÃO
  { id: 'lum_01', category: 'elec_lighting', description: 'Instalação de Interruptor Simples/Pulsador', unit: 'unid', basePrice: 55 },
  { id: 'lum_02', category: 'elec_lighting', description: 'Instalação de Lustres Simples ou Luminária', unit: 'unid', basePrice: 97.5 },
  { id: 'lum_03', category: 'elec_lighting', description: 'Instalação de Refletor de Jardim', unit: 'unid', basePrice: 110 },
  { id: 'lum_04', category: 'elec_lighting', description: 'Instalação de Perfil de LED (m)', unit: 'm', basePrice: 170 },
  
  // PONTO DE UTILIZAÇÃO
  { id: 'pnt_01', category: 'elec_point', description: 'Instalação de Tomada Simples', unit: 'unid', basePrice: 45 },
  { id: 'pnt_02', category: 'elec_point', description: 'Instalação de Chuveiro Elétrico Simples', unit: 'unid', basePrice: 95 },
  { id: 'pnt_03', category: 'elec_point', description: 'Instalação de Ventilador de Teto', unit: 'unid', basePrice: 150 },
  { id: 'pnt_04', category: 'elec_point', description: 'Instalação de Câmera CFTV Wi-Fi', unit: 'unid', basePrice: 160 },
  { id: 'pnt_05', category: 'elec_point', description: 'Instalação de Interfone 1 Chamada', unit: 'unid', basePrice: 175 },
  
  // QUADROS DE DISTRIBUIÇÃO / PAINEL
  { id: 'qdc_01', category: 'elec_panel', description: 'Substituição de Disjuntor Monofásico', unit: 'unid', basePrice: 55 },
  { id: 'qdc_02', category: 'elec_panel', description: 'Instalação de IDR (Interruptor Diferencial)', unit: 'unid', basePrice: 140 },
  { id: 'qdc_03', category: 'elec_panel', description: 'Instalação e Montagem QDC (12 disc.)', unit: 'unid', basePrice: 775 },
  { id: 'qdc_04', category: 'elec_panel', description: 'Instalação e Montagem QDC (24 disc.)', unit: 'unid', basePrice: 1290 },
  
  // PASSAGEM DE CABOS
  { id: 'cab_01', category: 'elec_cables', description: 'Entrada Monofásica (QM para QDC)', unit: 'unid', basePrice: 200 },
  { id: 'cab_02', category: 'elec_cables', description: 'Alimentação de Motores', unit: 'unid', basePrice: 190 },
  
  // SOLUÇÃO DE PROBLEMAS
  { id: 'prb_01', category: 'elec_troubleshoot', description: 'Curto Circuito Monofásico', unit: 'visita', basePrice: 160 },
  { id: 'prb_02', category: 'elec_troubleshoot', description: 'Curto Circuito Trifásico', unit: 'visita', basePrice: 220 },
  
  // PADRÃO DE ENTRADA
  { id: 'ent_01', category: 'elec_entry', description: 'Instalação de Medidor (Mono 127/220V)', unit: 'unid', basePrice: 1390 },
  { id: 'ent_02', category: 'elec_entry', description: 'Instalação de Medidor (Tri 220V)', unit: 'unid', basePrice: 1825 },
  
  // CARREGADO VEICULAR
  { id: 'evc_01', category: 'elec_ev', description: 'Instalação Carregador Veicular', unit: 'unid', basePrice: 1000 },
  
  // AUTOMAÇÃO RESIDENCIAL
  { id: 'aut_01', category: 'elec_automation', description: 'Instalação de Interruptor Inteligente', unit: 'unid', basePrice: 190 },
  { id: 'aut_02', category: 'elec_automation', description: 'Configuração Assistente Virtual', unit: 'unid', basePrice: 160 },
  { id: 'aut_03', category: 'elec_automation', description: 'Instalação de Tomada Inteligente', unit: 'unid', basePrice: 100 },
];

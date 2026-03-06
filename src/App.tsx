import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  FileText, 
  Plus, 
  Search, 
  MapPin, 
  Signature as SignatureIcon, 
  Camera, 
  Send, 
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
  Sun,
  Wrench,
  Trash2,
  Download,
  Share2,
  X,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { PhotoUpload } from './components/PhotoUpload';
import { SignaturePad } from './components/SignaturePad';
import { 
  Customer, 
  Supplier, 
  Budget, 
  ServiceItem, 
  PREDEFINED_SERVICES, 
  BudgetService,
  cn
} from './types';

// --- Mock Data ---
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-7777', address: 'Rua das Flores, 123', createdAt: Date.now() },
  { id: 'c2', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 97777-6666', address: 'Av. Brasil, 456', createdAt: Date.now() },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'SolarTech Distribuidora', contactName: 'Ricardo', email: 'vendas@solartech.com', phone: '(11) 3333-4444', products: 'Painéis, Inversores', terms: '30 dias', createdAt: Date.now() },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'suppliers' | 'budgets'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  
  const [newBudget, setNewBudget] = useState<Partial<Budget & { checklist: Record<string, boolean> }>>({
    services: [],
    status: 'draft',
    photos: [],
    checklist: {
      'Estrutura de fixação ok': false,
      'Sombreamento verificado': false,
      'Acesso ao telhado seguro': false,
      'Quadro elétrico compatível': false,
      'Aterramento disponível': false,
    }
  });

  const toggleChecklist = (item: string) => {
    setNewBudget({
      ...newBudget,
      checklist: {
        ...newBudget.checklist,
        [item]: !newBudget.checklist?.[item]
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState('');

  const categoryLabels = {
    solar: 'Energia Solar',
    elec_lighting: 'Iluminação',
    elec_point: 'Ponto de Utilização',
    elec_panel: 'Quadros / Painéis',
    elec_cables: 'Passagem de Cabos',
    elec_troubleshoot: 'Solução de Problemas',
    elec_entry: 'Padrão de Entrada',
    elec_ev: 'Carregado Veicular',
    elec_automation: 'Automação Residencial'
  };

  const filteredServices = PREDEFINED_SERVICES.filter(s => 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
      } : c));
      setEditingCustomer(null);
    } else {
      const customer: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        createdAt: Date.now(),
      };
      setCustomers([...customers, customer]);
      setIsAddingCustomer(false);
    }
  };

  const handleAddSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? {
        ...s,
        name: formData.get('name') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        products: formData.get('products') as string,
        terms: formData.get('terms') as string,
      } : s));
      setEditingSupplier(null);
    } else {
      const supplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.get('name') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        products: formData.get('products') as string,
        terms: formData.get('terms') as string,
        createdAt: Date.now(),
      };
      setSuppliers([...suppliers, supplier]);
      setIsAddingSupplier(false);
    }
  };

  const addServiceToBudget = (service: ServiceItem) => {
    const existing = newBudget.services?.find(s => s.serviceId === service.id);
    if (existing) {
      setNewBudget({
        ...newBudget,
        services: newBudget.services?.map(s => 
          s.serviceId === service.id 
            ? { ...s, quantity: s.quantity + 1, total: (s.quantity + 1) * s.price } 
            : s
        )
      });
    } else {
      const newService: BudgetService = {
        serviceId: service.id,
        description: service.description,
        quantity: 1,
        price: service.basePrice,
        total: service.basePrice
      };
      setNewBudget({
        ...newBudget,
        services: [...(newBudget.services || []), newService]
      });
    }
  };

  const removeServiceFromBudget = (serviceId: string) => {
    setNewBudget({
      ...newBudget,
      services: newBudget.services?.filter(s => s.serviceId !== serviceId)
    });
  };

  const calculateTotal = () => {
    return newBudget.services?.reduce((acc, s) => acc + s.total, 0) || 0;
  };

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    if (!reportRef.current || !selectedBudget) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = reportRef.current;
      
      // Temporarily remove overflow and set height to auto to capture full content
      const originalHeight = element.style.height;
      const originalOverflow = element.style.overflow;
      
      element.style.height = 'auto';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
      });
      
      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Relatorio_${selectedBudget.id}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const saveBudget = () => {
    if (!newBudget.customerId) return alert('Selecione um cliente');
    
    const budget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: newBudget.customerId,
      services: newBudget.services || [],
      totalAmount: calculateTotal(),
      status: 'sent',
      createdAt: Date.now(),
      geo: geoCoords || undefined,
      photos: newBudget.photos,
      signature: newBudget.signature
    };
    
    setBudgets([budget, ...budgets]);
    setIsCreatingBudget(false);
    setNewBudget({ services: [], status: 'draft', photos: [] });
  };

  const shareBudget = (budget: Budget) => {
    const customer = customers.find(c => c.id === budget.customerId);
    const text = `Olá ${customer?.name}, segue o orçamento para o serviço de energia solar.\nTotal: R$ ${budget.totalAmount.toLocaleString('pt-BR')}\nLocalização: https://www.google.com/maps?q=${budget.geo?.lat},${budget.geo?.lng}`;
    const url = `https://wa.me/${customer?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white border-r border-zinc-200 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white overflow-hidden border border-amber-500 shadow-lg shadow-amber-500/20">
            <img 
              src="https://picsum.photos/seed/solar-panel/200/200" 
              alt="EMC Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-lg font-black text-zinc-900 tracking-tighter leading-none">
            EMC<span className="text-amber-600">Solar</span><br/>Install <span className="text-xs font-bold bg-amber-600 text-white px-1 rounded ml-0.5">PRO</span>
          </h1>
        </div>
        
        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard size={20} />}
          label="Painel"
        />
        <NavItem 
          active={activeTab === 'customers'} 
          onClick={() => setActiveTab('customers')}
          icon={<Users size={20} />}
          label="Clientes"
        />
        <NavItem 
          active={activeTab === 'suppliers'} 
          onClick={() => setActiveTab('suppliers')}
          icon={<Truck size={20} />}
          label="Fornecedores"
        />
        <NavItem 
          active={activeTab === 'budgets'} 
          onClick={() => setActiveTab('budgets')}
          icon={<FileText size={20} />}
          label="Orçamentos"
        />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Dashboard de Operações</h2>
                  <p className="text-zinc-500">Monitoramento em tempo real das suas instalações.</p>
                </div>
                <Button onClick={() => { setActiveTab('budgets'); setIsCreatingBudget(true); }}>
                  <Plus size={20} className="mr-2" /> Novo Orçamento
                </Button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FileText className="text-blue-600" />} label="Orçamentos" value={budgets.length.toString()} color="bg-blue-50" />
                <StatCard icon={<Users className="text-amber-600" />} label="Clientes" value={customers.length.toString()} color="bg-amber-50" />
                <StatCard icon={<Zap className="text-amber-600" />} label="Serviços" value="12" color="bg-amber-50" />
              </div>

              <Card title="Atividades Recentes">
                <div className="flex flex-col gap-4">
                  {budgets.length === 0 ? (
                    <p className="text-zinc-400 text-center py-8">Nenhum orçamento realizado ainda.</p>
                  ) : (
                    budgets.slice(0, 5).map(budget => (
                      <div key={budget.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                            <FileText size={20} className="text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">{customers.find(c => c.id === budget.customerId)?.name}</p>
                            <p className="text-xs text-zinc-500">{format(budget.createdAt, "dd 'de' MMMM", { locale: ptBR })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase block">Total</span>
                          <p className="font-bold text-amber-600">R$ {budget.totalAmount.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div 
              key="customers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Clientes</h2>
                <Button onClick={() => { setIsAddingCustomer(true); setEditingCustomer(null); }}>
                  <Plus size={20} className="mr-2" /> Novo Cliente
                </Button>
              </div>

              {(isAddingCustomer || editingCustomer) && (
                <Card title={editingCustomer ? "Editar Cliente" : "Cadastrar Cliente"} className="border-amber-200">
                  <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="name" label="Nome Completo" defaultValue={editingCustomer?.name} required />
                    <Input name="email" label="E-mail" type="email" defaultValue={editingCustomer?.email} required />
                    <Input name="phone" label="Telefone" defaultValue={editingCustomer?.phone} required />
                    <Input name="address" label="Endereço" defaultValue={editingCustomer?.address} required />
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <Button variant="outline" type="button" onClick={() => { setIsAddingCustomer(false); setEditingCustomer(null); }}>Cancelar</Button>
                      <Button type="submit">{editingCustomer ? "Salvar Alterações" : "Salvar Cliente"}</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(customer => (
                  <Card key={customer.id} className="hover:border-amber-200 transition-colors">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-zinc-900">{customer.name}</h3>
                      <p className="text-sm text-zinc-500 flex items-center gap-2"><Send size={14} /> {customer.email}</p>
                      <p className="text-sm text-zinc-500 flex items-center gap-2"><MapPin size={14} /> {customer.address}</p>
                      <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-between items-center">
                        <span className="text-xs text-zinc-400">Desde {format(customer.createdAt, 'MM/yyyy')}</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingCustomer(customer); setIsAddingCustomer(false); }}>
                            <Edit2 size={14} className="mr-1" /> Editar
                          </Button>
                          <Button variant="ghost" size="sm">Ver Histórico</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'suppliers' && (
            <motion.div 
              key="suppliers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Fornecedores</h2>
                <Button onClick={() => { setIsAddingSupplier(true); setEditingSupplier(null); }}>
                  <Plus size={20} className="mr-2" /> Novo Fornecedor
                </Button>
              </div>

              {(isAddingSupplier || editingSupplier) && (
                <Card title={editingSupplier ? "Editar Fornecedor" : "Cadastrar Fornecedor"} className="border-amber-200">
                  <form onSubmit={handleAddSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="name" label="Nome da Empresa" defaultValue={editingSupplier?.name} required />
                    <Input name="contactName" label="Nome do Contato" defaultValue={editingSupplier?.contactName} required />
                    <Input name="email" label="E-mail" type="email" defaultValue={editingSupplier?.email} required />
                    <Input name="phone" label="Telefone" defaultValue={editingSupplier?.phone} required />
                    <Input name="products" label="Produtos Oferecidos" defaultValue={editingSupplier?.products} required />
                    <Input name="terms" label="Termos de Parceria" defaultValue={editingSupplier?.terms} required />
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <Button variant="outline" type="button" onClick={() => { setIsAddingSupplier(false); setEditingSupplier(null); }}>Cancelar</Button>
                      <Button type="submit">{editingSupplier ? "Salvar Alterações" : "Salvar Fornecedor"}</Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map(supplier => (
                  <Card key={supplier.id}>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-zinc-900">{supplier.name}</h3>
                        <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase">{supplier.terms}</span>
                      </div>
                      <p className="text-sm text-zinc-600"><strong>Contato:</strong> {supplier.contactName}</p>
                      <p className="text-sm text-zinc-600"><strong>Produtos:</strong> {supplier.products}</p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingSupplier(supplier); setIsAddingSupplier(false); }}>
                          <Edit2 size={14} className="mr-1" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">WhatsApp</Button>
                        <Button variant="outline" size="sm" className="flex-1">E-mail</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'budgets' && (
            <motion.div 
              key="budgets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">Orçamentos & Relatórios</h2>
                {!isCreatingBudget && (
                  <Button onClick={() => setIsCreatingBudget(true)}>
                    <Plus size={20} className="mr-2" /> Novo Orçamento
                  </Button>
                )}
              </div>

              {isCreatingBudget ? (
                <div className="flex flex-col gap-6">
                  <Card title="Novo Orçamento Dinâmico">
                    <div className="flex flex-col gap-6">
                      {/* Customer Selection */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-zinc-700">Selecionar Cliente</label>
                        <select 
                          className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          onChange={(e) => setNewBudget({ ...newBudget, customerId: e.target.value })}
                          value={newBudget.customerId || ''}
                        >
                          <option value="">Selecione um cliente...</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      {/* Service Selection */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <label className="text-sm font-medium text-zinc-700">Adicionar Serviços</label>
                          <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input 
                              type="text" 
                              placeholder="Buscar serviço..." 
                              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto pr-2 flex flex-col gap-6">
                          {Object.entries(groupedServices).map(([category, services]) => (
                            <div key={category} className="flex flex-col gap-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                                {categoryLabels[category as keyof typeof categoryLabels]}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {services.map(service => (
                                  <button
                                    key={service.id}
                                    onClick={() => addServiceToBudget(service)}
                                    className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left"
                                  >
                                    <div className="flex-1 pr-2">
                                      <p className="text-sm font-semibold text-zinc-900 leading-tight">{service.description}</p>
                                      <p className="text-xs text-zinc-500 mt-1">R$ {service.basePrice.toLocaleString('pt-BR')} / {service.unit}</p>
                                    </div>
                                    <Plus size={16} className="text-amber-600 shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selected Services List */}
                      {newBudget.services && newBudget.services.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-medium text-zinc-700">Itens do Orçamento</label>
                          <div className="border border-zinc-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-zinc-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Serviço</th>
                                  <th className="px-4 py-2 text-center">Qtd</th>
                                  <th className="px-4 py-2 text-right">Total</th>
                                  <th className="px-4 py-2 text-center"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {newBudget.services.map(s => (
                                  <tr key={s.serviceId} className="border-t border-zinc-50">
                                    <td className="px-4 py-3">{s.description}</td>
                                    <td className="px-4 py-3 text-center">{s.quantity}</td>
                                    <td className="px-4 py-3 text-right font-medium">R$ {s.total.toLocaleString('pt-BR')}</td>
                                    <td className="px-4 py-3 text-center">
                                      <button onClick={() => removeServiceFromBudget(s.serviceId)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-blue-900 text-white">
                                  <td colSpan={2} className="px-4 py-3 font-bold">TOTAL</td>
                                  <td className="px-4 py-3 text-right font-bold">R$ {calculateTotal().toLocaleString('pt-BR')}</td>
                                  <td></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Checklist Section */}
                      <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-zinc-700">Checklist de Vistoria Técnica</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(newBudget.checklist || {}).map(([item, checked]) => (
                            <button
                              key={item}
                              onClick={() => toggleChecklist(item)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                checked ? "bg-zinc-100 border-zinc-300 text-zinc-900" : "bg-white border-zinc-200 text-zinc-600"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded flex items-center justify-center border",
                                checked ? "bg-amber-600 border-amber-600 text-white" : "border-zinc-300"
                              )}>
                                {checked && <CheckCircle2 size={14} />}
                              </div>
                              <span className="text-sm font-medium">{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Photos & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                          <label className="text-sm font-medium text-zinc-700">Fotos da Vistoria</label>
                          <PhotoUpload onPhotosChange={(photos) => setNewBudget({ ...newBudget, photos })} />
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="text-sm font-medium text-zinc-700">Localização do Serviço</label>
                          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
                            <MapPin className="text-amber-600" />
                            <div>
                              <p className="text-sm font-medium text-zinc-900">Coordenadas Registradas</p>
                              <p className="text-xs text-zinc-500">
                                {geoCoords ? `${geoCoords.lat.toFixed(6)}, ${geoCoords.lng.toFixed(6)}` : 'Obtendo localização...'}
                              </p>
                            </div>
                          </div>
                          
                          <label className="text-sm font-medium text-zinc-700 mt-2">Assinatura do Cliente</label>
                          <SignaturePad onSave={(sig) => setNewBudget({ ...newBudget, signature: sig })} />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                        <Button variant="outline" onClick={() => setIsCreatingBudget(false)}>Cancelar</Button>
                        <Button onClick={saveBudget} disabled={!newBudget.customerId || !newBudget.services?.length}>
                          Gerar Relatório & Salvar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {budgets.map(budget => (
                    <Card key={budget.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedBudget(budget)}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-zinc-900">{customers.find(c => c.id === budget.customerId)?.name}</h3>
                            <p className="text-sm text-zinc-500">{format(budget.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">Aprovado</span>
                              {budget.geo && <span className="text-[10px] text-zinc-400 flex items-center gap-1"><MapPin size={10} /> Localizado</span>}
                              {budget.signature && <span className="text-[10px] text-zinc-400 flex items-center gap-1"><SignatureIcon size={10} /> Assinado</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Valor Total</span>
                          <p className="text-2xl font-black text-amber-600">R$ {budget.totalAmount.toLocaleString('pt-BR')}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => shareBudget(budget)}>
                              <Share2 size={16} className="mr-2" /> WhatsApp
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Download size={16} className="mr-2" /> PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {budgets.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100">
                      <FileText size={48} className="mx-auto text-zinc-200 mb-4" />
                      <p className="text-zinc-500">Nenhum orçamento gerado ainda.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreatingBudget(true)}>Criar Primeiro Orçamento</Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <div>
                  <h3 className="text-xl font-bold">Relatório de Serviço</h3>
                  <p className="text-zinc-400 text-sm">ID: {selectedBudget.id}</p>
                </div>
                <button onClick={() => setSelectedBudget(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div id="report-content" ref={reportRef} className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-zinc-900 border-b pb-2">Dados do Cliente</h4>
                    <div className="text-sm text-zinc-600 space-y-1">
                      <p><strong>Nome:</strong> {customers.find(c => c.id === selectedBudget.customerId)?.name}</p>
                      <p><strong>Endereço:</strong> {customers.find(c => c.id === selectedBudget.customerId)?.address}</p>
                      <p><strong>Data:</strong> {format(selectedBudget.createdAt, "dd/MM/yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-zinc-900 border-b pb-2">Localização</h4>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
                      <MapPin className="text-amber-600" />
                      <p className="text-xs font-mono">{selectedBudget.geo?.lat.toFixed(6)}, {selectedBudget.geo?.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-zinc-900 border-b pb-2">Serviços Realizados</h4>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Descrição</th>
                          <th className="px-4 py-2 text-center">Qtd</th>
                          <th className="px-4 py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBudget.services.map((s, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-3">{s.description}</td>
                            <td className="px-4 py-3 text-center">{s.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">R$ {s.total.toLocaleString('pt-BR')}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-50 font-bold">
                          <td colSpan={2} className="px-4 py-3">TOTAL</td>
                          <td className="px-4 py-3 text-right">R$ {selectedBudget.totalAmount.toLocaleString('pt-BR')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedBudget.photos && selectedBudget.photos.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-zinc-900 border-b pb-2">Evidências Fotográficas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedBudget.photos.map((photo, i) => (
                        <img key={i} src={photo} className="w-full aspect-square object-cover rounded-xl border" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-zinc-900 border-b pb-2">Assinatura do Cliente</h4>
                    {selectedBudget.signature ? (
                      <div className="border rounded-xl p-4 bg-zinc-50">
                        <img src={selectedBudget.signature} className="max-h-32 mx-auto" />
                      </div>
                    ) : (
                      <p className="text-zinc-400 italic text-sm">Não assinado</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-4 justify-end">
                    <Button onClick={() => shareBudget(selectedBudget)} className="w-full">
                      <Share2 size={20} className="mr-2" /> Enviar via WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                    >
                      <Download size={20} className="mr-2" /> 
                      {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
        active 
          ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" 
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="border-none shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

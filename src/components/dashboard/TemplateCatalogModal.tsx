import React, { useState } from 'react';
import { DESIGN_FAMILIES } from '../../data/templates';
import { MORELOS_PARTIES } from '../../data/parties';
import { X, Palette, Plus, Sparkles, Check, ArrowRight } from 'lucide-react';

interface TemplateCatalogModalProps {
  onClose: () => void;
  onCreateFromTemplate: (familyId: string, variantId: string, partyId: string) => void;
}

export const TemplateCatalogModal: React.FC<TemplateCatalogModalProps> = ({
  onClose,
  onCreateFromTemplate,
}) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(DESIGN_FAMILIES[0].id);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    DESIGN_FAMILIES[0].variants[0].id
  );
  const [selectedPartyId, setSelectedPartyId] = useState<string>('PAN');

  const currentFamily =
    DESIGN_FAMILIES.find((f) => f.id === selectedFamilyId) || DESIGN_FAMILIES[0];

  const handleApply = () => {
    onCreateFromTemplate(selectedFamilyId, selectedVariantId, selectedPartyId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Palette className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Estudio de Diseño LAV — Catálogo Maestro
              </h3>
              <p className="text-xs text-slate-500">
                10 familias de diseño con 50 variantes visuales. Combina libremente con cualquier partido o cargo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Families List Sidebar */}
          <div className="w-1/3 border-r border-slate-200 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              1. Familias de Diseño:
            </span>
            {DESIGN_FAMILIES.map((fam) => {
              const active = selectedFamilyId === fam.id;
              return (
                <div
                  key={fam.id}
                  onClick={() => {
                    setSelectedFamilyId(fam.id);
                    setSelectedVariantId(fam.variants[0]?.id || '');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <h4 className="font-bold text-xs">{fam.name}</h4>
                  <p
                    className={`text-[11px] line-clamp-2 mt-0.5 leading-snug ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {fam.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Variants and Customizer Main Area */}
          <div className="w-2/3 overflow-y-auto p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  2. Variantes de Composición para "{currentFamily.name}":
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentFamily.variants.length} variantes estructurales
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFamily.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{v.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{v.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Associate Party / Colors */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                3. Asociar Identidad Partidista o Cívica Inicial:
              </span>
              <div className="flex flex-wrap gap-2">
                {MORELOS_PARTIES.slice(0, 12).map((party) => {
                  const active = selectedPartyId === party.id;
                  return (
                    <button
                      key={party.id}
                      type="button"
                      onClick={() => setSelectedPartyId(party.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: party.defaultPalette.primary }}
                      />
                      {party.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Se creará un nuevo proyecto configurado con esta familia y variante.
          </span>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span>Crear Proyecto con este Diseño</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

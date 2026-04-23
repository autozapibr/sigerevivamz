import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProvinceSelectorProps {
  selectedProvince: string;
  selectedDistrict: string;
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  provinceLabel?: string;
  districtLabel?: string;
  required?: boolean;
}

export function ProvinceSelector({
  selectedProvince,
  selectedDistrict,
  onProvinceChange,
  onDistrictChange,
  provinceLabel = 'Província',
  districtLabel = 'Distrito',
  required = false,
}: ProvinceSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>
          {provinceLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          placeholder="Ex: Nampula"
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>
          {districtLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          placeholder="Ex: Cidade de Nampula"
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
        />
      </div>
    </div>
  );
}

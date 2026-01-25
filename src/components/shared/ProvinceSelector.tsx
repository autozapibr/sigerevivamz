import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROVINCES, DISTRICTS_BY_PROVINCE, Province } from '@/lib/validators/mozambique';

interface ProvinceSelectorProps {
  selectedProvince: Province | '';
  selectedDistrict: string;
  onProvinceChange: (province: Province) => void;
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
  const districts = selectedProvince ? DISTRICTS_BY_PROVINCE[selectedProvince] : [];

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value as Province);
    onDistrictChange(''); // Reset district when province changes
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>
          {provinceLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar província" />
          </SelectTrigger>
          <SelectContent>
            {PROVINCES.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          {districtLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select
          value={selectedDistrict}
          onValueChange={onDistrictChange}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedProvince ? "Seleccionar distrito" : "Primeiro seleccione a província"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

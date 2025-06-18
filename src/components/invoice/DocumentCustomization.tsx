import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DocumentCustomizationProps {
  documentType: 'invoice' | 'receipt';
  colorScheme: string;
  onColorSchemeChange: (scheme: string) => void;
  darkMode?: boolean;
  onDarkModeChange?: (enabled: boolean) => void;
  watermarkEnabled?: boolean;
  onWatermarkEnabledChange?: (enabled: boolean) => void;
  watermarkColor?: string;
  onWatermarkColorChange?: (color: string) => void;
  watermarkOpacity?: number;
  onWatermarkOpacityChange?: (opacity: number) => void;
  watermarkDensity?: number;
  onWatermarkDensityChange?: (density: number) => void;
}

export const DocumentCustomization: React.FC<DocumentCustomizationProps> = ({
  documentType,
  colorScheme,
  onColorSchemeChange,
  darkMode = false,
  onDarkModeChange,
  watermarkEnabled = true,
  onWatermarkEnabledChange,
  watermarkColor = '#9ca3af',
  onWatermarkColorChange,
  watermarkOpacity = 20,
  onWatermarkOpacityChange,
  watermarkDensity = 30,
  onWatermarkDensityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorSchemes = [
    { id: 'blue', name: 'Ocean Blue', primary: '#2563eb', secondary: '#3b82f6' },
    { id: 'purple', name: 'Royal Purple', primary: '#9333ea', secondary: '#a855f7' },
    { id: 'green', name: 'Forest Green', primary: '#16a34a', secondary: '#22c55e' },
    { id: 'red', name: 'Crimson Red', primary: '#dc2626', secondary: '#ef4444' },
    { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316' },
    { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#14b8a6' },
    { id: 'indigo', name: 'Deep Indigo', primary: '#4338ca', secondary: '#6366f1' }
  ];

  const watermarkColors = [
    { name: 'Light Gray', value: '#9ca3af' },
    { name: 'Blue Gray', value: '#64748b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' }
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="bg-gradient-to-r from-fuchsia-200 to-violet-300 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Document Customization
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 bg-indigo-100">
            <div>
              <Label className="text-base font-medium mb-3 block">Color Scheme</Label>
              <div className="grid grid-cols-7 gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={`relative h-12 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      colorScheme === scheme.id 
                        ? 'border-gray-900 dark:border-white scale-110 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)` 
                    }}
                    onClick={() => onColorSchemeChange(scheme.id)}
                    title={scheme.name}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Selected: {colorSchemes.find(s => s.id === colorScheme)?.name}
              </p>
            </div>

            {documentType === 'receipt' && (
              <>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={onDarkModeChange}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Enable Watermark</Label>
                    <Switch
                      checked={watermarkEnabled}
                      onCheckedChange={onWatermarkEnabledChange}
                    />
                  </div>

                  {watermarkEnabled && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Watermark Color</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {watermarkColors.map((color) => (
                            <button
                              key={color.value}
                              className={`w-full h-12 rounded-lg border-2 transition-all transform hover:scale-105 ${
                                watermarkColor === color.value 
                                  ? 'border-gray-900 dark:border-white scale-110 shadow-lg' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => onWatermarkColorChange?.(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Watermark Opacity: {watermarkOpacity}%
                        </Label>
                        <Slider
                          value={[watermarkOpacity]}
                          onValueChange={([value]) => onWatermarkOpacityChange?.(value)}
                          min={5}
                          max={60}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 block">
                          Watermark Density: {watermarkDensity}%
                        </Label>
                        <Slider
                          value={[watermarkDensity]}
                          onValueChange={([value]) => onWatermarkDensityChange?.(value)}
                          min={10}
                          max={80}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

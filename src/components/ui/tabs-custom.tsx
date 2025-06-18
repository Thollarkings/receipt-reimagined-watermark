
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TabsCustomProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListCustomProps {
  children: React.ReactNode;
  className?: string;
  twoRows?: boolean;
}

interface TabsTriggerCustomProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentCustomProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsCustomContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: '',
  onValueChange: () => {},
});

export const TabsCustom: React.FC<TabsCustomProps> = ({
  defaultValue,
  children,
  className,
}) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsCustomContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={cn('bg-gradient-to-r from-fuchsia-200 to-violet-300 rounded-lg p-6', className)} role="tablist">
        {children}
      </div>
    </TabsCustomContext.Provider>
  );
};

export const TabsListCustom: React.FC<TabsListCustomProps> = ({
  children,
  className,
  twoRows = false,
}) => {
  const childrenArray = React.Children.toArray(children);
  
  if (twoRows) {
    const firstRow = childrenArray.slice(0, 4);
    const secondRow = childrenArray.slice(4, 8);
    
    return (
      <div className={cn('mb-6', className)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {firstRow}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {secondRow}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto',
        'sm:flex-nowrap sm:gap-2',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
};

export const TabsTriggerCustom: React.FC<TabsTriggerCustomProps> = ({
  value,
  children,
  className,
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsCustomContext);
  const isSelected = selectedValue === value;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    onValueChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onValueChange(value);
    }
  };

  return (
    <button
      ref={buttonRef}
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      className={cn(
        'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'whitespace-nowrap border border-gray-400',
        isSelected
          ? 'bg-fuchsia-200 text-black border-gray-300 shadow-sm'
          : 'bg-black text-white hover:bg-gray-800 hover:border-gray-300',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
};

export const TabsContentCustom: React.FC<TabsContentCustomProps> = ({
  value,
  children,
  className,
}) => {
  const { value: selectedValue } = React.useContext(TabsCustomContext);
  const isSelected = selectedValue === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-hidden={!isSelected}
      className={cn(
        'transition-all duration-300',
        isSelected ? 'animate-fade-in' : 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
};

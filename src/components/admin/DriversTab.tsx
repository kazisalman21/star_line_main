import { PersonnelTab } from '@/components/admin/PersonnelTab';

export function DriversTab() {
  return (
    <PersonnelTab
      role="driver"
      title="Driver Management"
      subtitle="registered drivers"
      showLicense
    />
  );
}

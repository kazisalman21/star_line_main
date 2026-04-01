import { PersonnelTab } from '@/components/admin/PersonnelTab';

export function SupervisorTab() {
  return (
    <PersonnelTab
      role="supervisor"
      title="Supervisor Management"
      subtitle="registered supervisors"
    />
  );
}

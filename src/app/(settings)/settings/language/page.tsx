import { RoleGate } from '@/shared/components/RoleGate';
import { LanguageForm } from '@/features/settings/components/LanguageForm';

export default function SettingsLanguagePage() {
  return (
    <RoleGate permission="manage_own_profile">
      <LanguageForm />
    </RoleGate>
  );
}

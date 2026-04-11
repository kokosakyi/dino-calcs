import { ModelTree } from './ModelTree';
import { PropertyEditor } from './PropertyEditor';

export function LeftSidebar() {
  return (
    <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto">
        <ModelTree />
      </div>
      <div className="border-t border-[var(--color-border)]">
        <PropertyEditor />
      </div>
    </div>
  );
}

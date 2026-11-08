import { useState } from 'react';
import { errorMessage } from '@/lib/format';
import { setFindingVerification } from '@/lib/scanRepository';
import type { VerificationStatus } from '@/types/scan';

const OPTIONS: { value: VerificationStatus; label: string }[] = [
  { value: 'scanner_reported', label: 'Scanner reported' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'verified', label: 'Verified' },
  { value: 'false_positive', label: 'False positive' },
];

interface VerificationSelectProps {
  findingId: string;
  value: VerificationStatus;
  onSaved: () => void;
}

export default function VerificationSelect({ findingId, value, onSaved }: VerificationSelectProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextValue: VerificationStatus) {
    setBusy(true);
    setError(null);
    try {
      await setFindingVerification(findingId, nextValue);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-40">
      <select
        aria-label="Verification status"
        className="field w-auto py-1.5 text-xs"
        value={value}
        disabled={busy}
        onChange={(event) => void handleChange(event.target.value as VerificationStatus)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

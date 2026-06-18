import React from 'react';
import { Instagram, Facebook, MessageCircle, Youtube, Music2 } from 'lucide-react';

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/tunegocio' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/tunegocio' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/5491112345678' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: 'https://tiktok.com/@tunegocio' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@tunegocio' },
];

function SocialLinksStep({ data, onChange }) {
  const links = data || {};

  function update(key, value) {
    onChange({ ...links, [key]: value });
  }

  return (
    <div className="space-y-4">
      {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
            <Icon size={16} className="text-[var(--color-text-muted)]" />
            {label}
          </label>
          <input
            type="url"
            value={links[key] || ''}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-[var(--color-bg-card)]"
          />
        </div>
      ))}

      <p className="text-sm text-[var(--color-text-muted)] pt-2">
        Dejá vacíos los que no uses. Aparecerán solo los que completes.
      </p>
    </div>
  );
}

export default SocialLinksStep;

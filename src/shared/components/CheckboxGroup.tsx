import { Fragment } from 'react'

interface ExtraField {
  when: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface CheckboxGroupProps {
  label: string
  options: readonly string[]
  values: string[]
  onChange: (next: string[]) => void
  otherText?: string
  onOtherTextChange?: (value: string) => void
  otherPlaceholder?: string
  multiOther?: string[]
  onMultiOtherChange?: (next: string[]) => void
  extraFields?: ExtraField[]
  exclusiveYok?: boolean
}

function optionStyle(option: string, checked: boolean) {
  if (option === 'Diğer') {
    return checked
      ? 'border-[var(--uk-gold)] bg-[color-mix(in_srgb,var(--uk-gold)_22%,var(--uk-surface))] text-[var(--uk-gold-text)] shadow-sm'
      : 'border-[var(--uk-gold)]/50 bg-[color-mix(in_srgb,var(--uk-gold)_12%,var(--uk-surface))] text-[var(--uk-gold-text)] border-dashed'
  }
  if (option === 'Yok') {
    return checked
      ? 'border-[#9a6b4f] bg-[color-mix(in_srgb,#9a6b4f_28%,var(--uk-surface))] text-[#6b4430] shadow-sm'
      : 'border-[#9a6b4f]/55 bg-[color-mix(in_srgb,#9a6b4f_10%,var(--uk-surface))] text-[#8a5a40] border-dashed'
  }
  return checked
    ? 'border-[var(--uk-green)] bg-[color-mix(in_srgb,var(--uk-green)_14%,var(--uk-surface))] text-[var(--uk-green)] shadow-sm'
    : 'border-[var(--uk-input-border)] bg-[var(--uk-input-bg)] text-[var(--uk-ink)]'
}

function checkStyle(option: string, checked: boolean) {
  if (option === 'Diğer') {
    return checked
      ? 'border-[var(--uk-gold)] bg-[var(--uk-gold)] text-white'
      : 'border-[var(--uk-gold)] bg-[var(--uk-surface)] text-transparent'
  }
  if (option === 'Yok') {
    return checked
      ? 'border-[#9a6b4f] bg-[#9a6b4f] text-white'
      : 'border-[#9a6b4f]/70 bg-[var(--uk-surface)] text-transparent'
  }
  return checked
    ? 'border-[var(--uk-green)] bg-[var(--uk-green)] text-white'
    : 'border-[var(--uk-input-border)] bg-[var(--uk-surface)] text-transparent'
}

function MultiOtherPanel({
  multiOther,
  onMultiOtherChange,
}: {
  multiOther: string[]
  onMultiOtherChange: (next: string[]) => void
}) {
  const items = multiOther.length ? multiOther : ['']
  return (
    <div className="col-span-2 space-y-2 rounded-2xl border border-dashed border-[var(--uk-gold)] bg-[color-mix(in_srgb,var(--uk-gold)_12%,var(--uk-surface))] p-3">
      <p className="text-sm font-semibold text-[var(--uk-gold-text)]">
        Diğer — birden fazla ekleyebilirsiniz
      </p>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            className="uk-input text-base"
            value={item}
            placeholder={`Diğer ${index + 1}`}
            onChange={(e) => {
              const next = [...items]
              next[index] = e.target.value
              onMultiOtherChange(next)
            }}
          />
          {items.length > 1 && (
            <button
              type="button"
              className="shrink-0 rounded-xl border border-[var(--uk-input-border)] px-3 text-sm text-[var(--uk-muted)]"
              onClick={() => {
                const next = items.filter((_, i) => i !== index)
                onMultiOtherChange(next.length ? next : [''])
              }}
            >
              Sil
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-[var(--uk-gold-text)] underline"
        onClick={() => onMultiOtherChange([...items, ''])}
      >
        + Başka diğer ekle
      </button>
    </div>
  )
}

export function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  otherText,
  onOtherTextChange,
  otherPlaceholder = 'Diğer nedir? Yazınız…',
  multiOther,
  onMultiOtherChange,
  extraFields,
  exclusiveYok = false,
}: CheckboxGroupProps) {
  function toggle(option: string) {
    if (exclusiveYok && option === 'Yok') {
      onChange(values.includes('Yok') ? [] : ['Yok'])
      return
    }

    let next = values.includes(option)
      ? values.filter((v) => v !== option)
      : [...values, option]

    if (exclusiveYok && option !== 'Yok') {
      next = next.filter((v) => v !== 'Yok')
    }

    onChange(next)

    if (option === 'Diğer' && values.includes('Diğer')) {
      onOtherTextChange?.('')
      onMultiOtherChange?.([])
    }
  }

  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-0.5 font-brand text-base font-semibold text-[var(--uk-green)]">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = values.includes(option)
          const extra = extraFields?.find((f) => f.when === option)
          const isWide = option === 'Diğer' || option === 'Yok' || Boolean(extra)

          return (
            <Fragment key={option}>
              <label
                className={[
                  'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-sm transition active:scale-[0.98]',
                  isWide ? 'col-span-2' : '',
                  optionStyle(option, checked),
                ].join(' ')}
              >
                <span
                  className={[
                    'flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold',
                    checkStyle(option, checked),
                  ].join(' ')}
                >
                  {option === 'Yok' ? '×' : '✓'}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggle(option)}
                />
                <span className="leading-snug font-medium">{option}</span>
              </label>

              {checked && extra && (
                <div className="col-span-2 rounded-2xl border border-[var(--uk-green)]/30 bg-[color-mix(in_srgb,var(--uk-green)_10%,var(--uk-surface))] p-3">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-[var(--uk-green)]">{extra.label}</span>
                    <input
                      className="uk-input text-base"
                      value={extra.value}
                      placeholder={extra.placeholder}
                      onChange={(e) => extra.onChange(e.target.value)}
                    />
                  </label>
                </div>
              )}

              {checked &&
                option === 'Diğer' &&
                onMultiOtherChange && (
                  <MultiOtherPanel
                    multiOther={multiOther ?? ['']}
                    onMultiOtherChange={onMultiOtherChange}
                  />
                )}

              {checked &&
                option === 'Diğer' &&
                onOtherTextChange &&
                !onMultiOtherChange && (
                  <div className="col-span-2 rounded-2xl border border-dashed border-[var(--uk-gold)] bg-[color-mix(in_srgb,var(--uk-gold)_12%,var(--uk-surface))] p-3">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-semibold text-[var(--uk-gold-text)]">
                        Diğer — açıklama
                      </span>
                      <input
                        className="uk-input text-base"
                        value={otherText ?? ''}
                        placeholder={otherPlaceholder}
                        onChange={(e) => onOtherTextChange(e.target.value)}
                      />
                    </label>
                  </div>
                )}
            </Fragment>
          )
        })}
      </div>
    </fieldset>
  )
}

/*
 * لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ
 * "Sevdiğiniz şeylerden infak etmedikçe iyiliğe eremezsiniz." (Âl-i İmrân 3/92)
 */

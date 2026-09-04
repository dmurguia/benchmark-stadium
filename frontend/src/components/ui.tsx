import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'text-[13px] px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-[15px] px-5 py-3'
  };
  const variants = {
    primary: 'bg-forest text-paper hover:bg-forest-hover',
    ghost: 'border border-hairline bg-transparent text-ink hover:bg-panel'
  };
  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props} />);


}

export function Card({
  className = '',
  children,
  as: As = 'div'




}: {className?: string;children: React.ReactNode;as?: 'div' | 'section' | 'article' | 'li';}) {
  return (
    <As
      className={`rounded-xl border border-hairline bg-card shadow-whisper ${className}`}>
      
      {children}
    </As>);

}

export function Eyebrow({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-muted ${className}`}>
      
      {children}
    </p>);

}

export function Chip({
  tone = 'neutral',
  className = '',
  children




}: {tone?: 'neutral' | 'green' | 'rust' | 'solid';className?: string;children: React.ReactNode;}) {
  const tones = {
    neutral: 'border-hairline bg-panel text-muted',
    green: 'border-[#c3d2bf] bg-moss-tint text-forest',
    rust: 'border-[#e0c4b9] bg-rust-tint text-rust',
    solid: 'border-forest bg-forest text-paper'
  };
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]} ${className}`}>
      
      {children}
    </span>);

}

export function PageHeader({
  eyebrow,
  title,
  description




}: {eyebrow?: string;title: string;description?: string;}) {
  return (
    <header className="mb-8">
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
      {description ?
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          {description}
        </p> :
      null}
    </header>);

}
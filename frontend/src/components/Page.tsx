import React from 'react';

export function Page({
  wide = false,
  children



}: {wide?: boolean;children: React.ReactNode;}) {
  return (
    <div
      className={`mx-auto w-full px-8 py-10 ${wide ? 'max-w-[1440px]' : 'max-w-content'}`}>
      
      {children}
    </div>);

}
import React from 'react';
// Test stub for @docusaurus/Link — renders a plain anchor.
export default function Link({to, children, ...rest}: {to: string; children?: React.ReactNode}) {
  return <a href={to} {...rest}>{children}</a>;
}

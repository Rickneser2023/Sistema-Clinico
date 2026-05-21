import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export default function Card({ 
  title, 
  subtitle, 
  extra, 
  children, 
  hoverable = false, 
  className = "" 
}: CardProps) {
  return (
    <div className={`card ${hoverable ? 'hoverable' : ''} ${className}`}>
      {(title || subtitle || extra) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>}
            {subtitle && <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>{subtitle}</p>}
          </div>
          {extra && <div className="card-extra">{extra}</div>}
        </div>
      )}
      <div className="card-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

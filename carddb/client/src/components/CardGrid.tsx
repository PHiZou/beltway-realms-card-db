import type { Card } from '../hooks/useCards';
import CardPreview from './CardPreview';

interface Props {
  cards: Card[];
  compareIds: Set<string>;
  onCompareToggle: (card: Card) => void;
}

export default function CardGrid({ cards, compareIds, onCompareToggle }: Props) {
  if (cards.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '80px 20px',
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</div>
        <p style={{ fontSize: '16px', fontWeight: 500 }}>No cards found</p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px',
    }}>
      {cards.map(card => (
        <CardPreview
          key={card.id}
          card={card}
          onCompareToggle={onCompareToggle}
          isComparing={compareIds.has(card.id)}
        />
      ))}
    </div>
  );
}

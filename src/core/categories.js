/**
 * World Building: Category Definitions
 * Defines the taxonomy for organizing Setting content.
 */

export const CATEGORIES = {
    person: {
        id: 'person',
        label: 'Person',
        icon: '👤',
        color: '#6366f1', // Indigo
        fields: [
            { key: 'role', label: 'Role', type: 'text' },
            { key: 'affiliation', label: 'Affiliation', type: 'text' },
            { key: 'motivation', label: 'Motivation', type: 'text' },
            { key: 'appearance', label: 'Appearance', type: 'textarea' }
        ]
    },
    location: {
        id: 'location',
        label: 'Location',
        icon: '📍',
        color: '#22c55e', // Green
        fields: [
            { key: 'region', label: 'Region', type: 'text' },
            { key: 'climate', label: 'Climate', type: 'text' },
            { key: 'pointsOfInterest', label: 'Points of Interest', type: 'textarea' }
        ]
    },
    faction: {
        id: 'faction',
        label: 'Faction',
        icon: '🏛️',
        color: '#f59e0b', // Amber
        fields: [
            { key: 'goals', label: 'Goals', type: 'textarea' },
            { key: 'allies', label: 'Allies', type: 'text' },
            { key: 'enemies', label: 'Enemies', type: 'text' }
        ]
    },
    concept: {
        id: 'concept',
        label: 'Concept',
        icon: '💡',
        color: '#8b5cf6', // Violet
        fields: [
            { key: 'domain', label: 'Domain', type: 'text' },
            { key: 'principles', label: 'Core Principles', type: 'textarea' }
        ]
    },
    event: {
        id: 'event',
        label: 'Event',
        icon: '📜',
        color: '#ef4444', // Red
        fields: [
            { key: 'era', label: 'Era/Date', type: 'text' },
            { key: 'participants', label: 'Participants', type: 'text' },
            { key: 'outcome', label: 'Outcome', type: 'textarea' }
        ]
    },
    item: {
        id: 'item',
        label: 'Item',
        icon: '🎁',
        color: '#14b8a6', // Teal
        fields: [
            { key: 'origin', label: 'Origin', type: 'text' },
            { key: 'properties', label: 'Properties', type: 'textarea' }
        ]
    }
};

export const getCategoryById = (id) => CATEGORIES[id] || CATEGORIES.item;
export const getAllCategories = () => Object.values(CATEGORIES);

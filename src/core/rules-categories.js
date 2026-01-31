/**
 * Core: Rules Categories
 * Taxonomy for game mechanics (Items, Spells, Abilities, etc.)
 * @module Core/RulesCategories
 */

export const RULE_CATEGORIES = [
    {
        id: 'item',
        label: 'Item',
        icon: '⚔️',
        color: '#f59e0b',
        description: 'Weapons, armor, consumables, and equipment',
        fields: [
            { key: 'type', label: 'Type', placeholder: 'weapon, armor, consumable, tool...' },
            { key: 'rarity', label: 'Rarity', placeholder: 'common, uncommon, rare, legendary...' },
            { key: 'damage', label: 'Damage/Effect', placeholder: '1d8 slashing, +2 AC...' },
            { key: 'properties', label: 'Properties', placeholder: 'versatile, finesse, two-handed...' },
            { key: 'value', label: 'Value', placeholder: '50 gold, priceless...' },
            { key: 'weight', label: 'Weight', placeholder: '3 lbs, light...' }
        ]
    },
    {
        id: 'spell',
        label: 'Spell',
        icon: '✨',
        color: '#8b5cf6',
        description: 'Magic spells and mystical abilities',
        fields: [
            { key: 'level', label: 'Level', placeholder: 'Cantrip, 1st, 2nd...' },
            { key: 'school', label: 'School', placeholder: 'Evocation, Necromancy...' },
            { key: 'castTime', label: 'Cast Time', placeholder: '1 action, bonus action, ritual...' },
            { key: 'range', label: 'Range', placeholder: '60 feet, touch, self...' },
            { key: 'duration', label: 'Duration', placeholder: 'Instantaneous, 1 minute, concentration...' },
            { key: 'damage', label: 'Effect/Damage', placeholder: '3d6 fire, heals 2d8+3...' },
            { key: 'components', label: 'Components', placeholder: 'V, S, M (a bat guano)...' }
        ]
    },
    {
        id: 'ability',
        label: 'Ability',
        icon: '💪',
        color: '#ef4444',
        description: 'Class features, racial traits, and special abilities',
        fields: [
            { key: 'source', label: 'Source', placeholder: 'Fighter 3, Elf racial, feat...' },
            { key: 'usage', label: 'Usage', placeholder: 'At will, 1/short rest, 3/long rest...' },
            { key: 'action', label: 'Action Cost', placeholder: 'Action, bonus action, reaction...' },
            { key: 'effect', label: 'Effect', placeholder: 'Add 1d6 to attack, advantage on saves...' },
            { key: 'prerequisite', label: 'Prerequisite', placeholder: 'STR 13, proficiency in...' }
        ]
    },
    {
        id: 'condition',
        label: 'Condition',
        icon: '🔥',
        color: '#06b6d4',
        description: 'Status effects, buffs, debuffs, and environmental conditions',
        fields: [
            { key: 'type', label: 'Type', placeholder: 'debuff, buff, environmental...' },
            { key: 'effect', label: 'Effect', placeholder: 'Disadvantage on attacks, -2 AC...' },
            { key: 'duration', label: 'Duration', placeholder: '1 round, until cured, permanent...' },
            { key: 'removal', label: 'Removal', placeholder: 'Lesser restoration, DC 15 CON save...' },
            { key: 'stacking', label: 'Stacking', placeholder: 'Does not stack, stacks to 3...' }
        ]
    },
    {
        id: 'rule',
        label: 'Rule',
        icon: '📜',
        color: '#22c55e',
        description: 'Custom game rules, house rules, and mechanics',
        fields: [
            { key: 'category', label: 'Category', placeholder: 'Combat, exploration, social, rest...' },
            { key: 'trigger', label: 'Trigger', placeholder: 'When attacking, on critical hit...' },
            { key: 'resolution', label: 'Resolution', placeholder: 'Roll contested Athletics, DC = 10 + CR...' },
            { key: 'consequences', label: 'Consequences', placeholder: 'On success... On failure...' }
        ]
    }
];

/**
 * Get all rule categories
 * @returns {Array}
 */
export function getAllRuleCategories() {
    return RULE_CATEGORIES;
}

/**
 * Get a rule category by ID
 * @param {string} id 
 * @returns {Object|undefined}
 */
export function getRuleCategoryById(id) {
    return RULE_CATEGORIES.find(c => c.id === id);
}

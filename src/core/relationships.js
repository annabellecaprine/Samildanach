/**
 * World Building: Relationship Types
 * Defines how entries can be connected to each other.
 */

export const RELATIONSHIP_TYPES = {
    member_of: {
        id: 'member_of',
        label: 'Member of',
        icon: '👥',
        inverse: 'has_member',
        description: 'This entry is a member of the target.'
    },
    has_member: {
        id: 'has_member',
        label: 'Has Member',
        icon: '👤',
        inverse: 'member_of',
        description: 'The target is a member of this entry.'
    },
    located_in: {
        id: 'located_in',
        label: 'Located in',
        icon: '📍',
        inverse: 'contains',
        description: 'This entry is located within the target.'
    },
    contains: {
        id: 'contains',
        label: 'Contains',
        icon: '🗺️',
        inverse: 'located_in',
        description: 'This entry contains the target.'
    },
    ally_of: {
        id: 'ally_of',
        label: 'Ally of',
        icon: '🤝',
        inverse: 'ally_of',
        description: 'This entry is allied with the target.'
    },
    enemy_of: {
        id: 'enemy_of',
        label: 'Enemy of',
        icon: '⚔️',
        inverse: 'enemy_of',
        description: 'This entry is an enemy of the target.'
    },
    parent_of: {
        id: 'parent_of',
        label: 'Parent of',
        icon: '👨‍👧',
        inverse: 'child_of',
        description: 'This entry is the parent of the target.'
    },
    child_of: {
        id: 'child_of',
        label: 'Child of',
        icon: '👶',
        inverse: 'parent_of',
        description: 'This entry is the child of the target.'
    },
    related_to: {
        id: 'related_to',
        label: 'Related to',
        icon: '🔗',
        inverse: 'related_to',
        description: 'Generic relationship.'
    },
    created_by: {
        id: 'created_by',
        label: 'Created by',
        icon: '🛠️',
        inverse: 'creator_of',
        description: 'This entry was created by the target.'
    },
    creator_of: {
        id: 'creator_of',
        label: 'Creator of',
        icon: '✨',
        inverse: 'created_by',
        description: 'This entry created the target.'
    }
};

export const getRelationshipById = (id) => RELATIONSHIP_TYPES[id] || RELATIONSHIP_TYPES.related_to;
export const getAllRelationshipTypes = () => Object.values(RELATIONSHIP_TYPES);

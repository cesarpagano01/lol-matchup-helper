import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('champion_history', (table) => {
        table.uuid('champion_history_id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
        table.uuid('champion_id').references('champions.champion_id').nullable()

        table.enum('operation', ['INSERT', 'UPDATE']).notNullable()

        table.jsonb('champion_history').defaultTo({}).notNullable()
        table.string('patch').notNullable()

        table.datetime('stamp').defaultTo(knex.raw('now()'))
    })
}

export async function down(knex: Knex): Promise<void> {
}

// {
//     name: '',
//     icon: '',
//     skins: {
//         ???
//     }
//     patch: "16.3"
//     status: {
//         ability_power
//         attack_damage
//         cooldown_reduction
//         hp
//         hp_per_level
//         mana
//         mana_per_level
//         move_speed
//         attack_range
//         armor
//         armor_per_level
//         spell_block
//         spell_block_per_level
//         attack_damage_per_level
//         patch
//     }
// }